import { NextRequest } from 'next/server'
import type { ResponseInput } from 'openai/resources/responses/responses'
import { getOpenAIClient } from '@/lib/openai'
import { prisma } from '@/lib/prisma'
import { AGATHA_SYSTEM_PROMPT } from '@/lib/agatha-prompt'
import { SENSITIVE_REDIRECT, SESSION_CONFIG } from '@/lib/constants'
import { createMessageSchema } from '@/lib/validations/session'
import { diagnosisJsonSchema, type DiagnosisJson } from '@/lib/validations/diagnosis'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

// ─── Detecção de conteúdo sensível ───────────────────────────────────────────

const SENSITIVE_KEYWORDS = [
  'suicid', 'me matar', 'não quero viver', 'acabar com tudo',
  'me machucar', 'automutila', 'overdose',
]

function isSensitive(text: string): boolean {
  const lower = text.toLowerCase()
  return SENSITIVE_KEYWORDS.some((kw) => lower.includes(kw))
}

// ─── Parse defensivo do JSON de diagnóstico ──────────────────────────────────

function parseDiagnosisJson(raw: string): DiagnosisJson | null {
  // A Agatha pode envolver o JSON em texto introdutório — tentamos extrair só o objeto
  const match = raw.match(/\{[\s\S]*\}/)
  if (!match) return null

  try {
    const json = JSON.parse(match[0])
    const result = diagnosisJsonSchema.safeParse(json)
    return result.success ? result.data : null
  } catch {
    return null
  }
}

// ─── Helpers de SSE ──────────────────────────────────────────────────────────

const encoder = new TextEncoder()

function sseChunk(payload: Record<string, unknown>): Uint8Array {
  return encoder.encode(`data: ${JSON.stringify(payload)}\n\n`)
}

// ─── Handler principal ────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. Rate limiting — verificado antes de qualquer I/O
  const ip = getClientIp(req.headers)
  const rl = checkRateLimit(ip)

  if (!rl.success) {
    return Response.json(
      { error: 'Muitas requisições. Aguarde um momento antes de tentar novamente.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(rl.retryAfter),
          'X-RateLimit-Limit': process.env.RATE_LIMIT_MAX ?? '20',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(rl.resetAt / 1000)),
        },
      },
    )
  }

  // 2. Parse e validação do body
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Body inválido — esperado JSON.' }, { status: 400 })
  }

  const parsed = createMessageSchema.safeParse({
    sessionId: (body as Record<string, unknown>).sessionId,
    turnNumber: (body as Record<string, unknown>).turnNumber,
    role: 'user',
    content: (body as Record<string, unknown>).content,
  })

  if (!parsed.success) {
    return Response.json(
      { error: 'Dados inválidos.', issues: parsed.error.issues },
      { status: 400 },
    )
  }

  const { sessionId, turnNumber, content } = parsed.data

  // 2. Carregar sessão + histórico completo
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { messages: { orderBy: { turnNumber: 'asc' } } },
  })

  if (!session) {
    return Response.json({ error: 'Sessão não encontrada.' }, { status: 404 })
  }
  if (session.status !== 'ACTIVE') {
    return Response.json({ error: 'Sessão já encerrada.' }, { status: 409 })
  }
  // Block only when strictly past the limit — i.e. the user already answered the
  // last question (diagnosis should have been generated on that turn). Using >=
  // here was the bug: it blocked the user from answering the MAX_QUESTIONS-th
  // question, since questionCount is incremented *after* each bot reply.
  if (session.questionCount > SESSION_CONFIG.MAX_QUESTIONS) {
    console.warn(
      `[/api/chat] Sessão ${sessionId} bloqueada: questionCount=${session.questionCount} > MAX=${SESSION_CONFIG.MAX_QUESTIONS}`,
    )
    return Response.json({ error: 'Limite de perguntas atingido.' }, { status: 422 })
  }

  console.log(
    `[/api/chat] sessionId=${sessionId} questionCount=${session.questionCount} MAX=${SESSION_CONFIG.MAX_QUESTIONS}`,
  )

  // 3. Detecção de conteúdo sensível
  const flaggedSensitive = isSensitive(content)

  // 4. Persistir mensagem do usuário
  await prisma.message.create({
    data: { sessionId, turnNumber, role: 'user', content, flaggedSensitive },
  })

  // 5. Conteúdo sensível → resposta segura sem chamar a OpenAI
  if (flaggedSensitive) {
    const safeReply = SENSITIVE_REDIRECT.MESSAGE

    await Promise.all([
      prisma.message.create({
        data: { sessionId, turnNumber: turnNumber + 1, role: 'bot', content: safeReply },
      }),
      prisma.session.update({
        where: { id: sessionId },
        data: { questionCount: { increment: 1 } },
      }),
    ])

    return Response.json({ reply: safeReply, flagged: true })
  }

  // 6. Montar histórico no formato da Responses API
  const history: ResponseInput = session.messages.map((m) => ({
    role: m.role === 'user' ? 'user' : 'assistant',
    content: m.content,
  }))

  const userContent = content === '__init__' ? 'Olá, Agatha!' : content

  const input: ResponseInput = [
    ...history,
    { role: 'user', content: userContent },
  ]

  // 7. Calcular se esta será a resposta de encerramento
  // questionCount = número de respostas do bot já entregues.
  // nextQuestionCount = como ficará após este turno ser concluído.
  const nextQuestionCount = session.questionCount + 1

  // isClosingTurn: modelo PODE gerar diagnóstico (MIN atingido)
  const isClosingTurn = nextQuestionCount >= SESSION_CONFIG.MIN_QUESTIONS

  // isForcedClose: modelo DEVE gerar diagnóstico (MAX atingido neste turno)
  const isForcedClose = session.questionCount >= SESSION_CONFIG.MAX_QUESTIONS

  if (isClosingTurn) {
    console.log(
      `[/api/chat] Turno de encerramento: questionCount=${session.questionCount} nextQuestionCount=${nextQuestionCount} isForcedClose=${isForcedClose}`,
    )
  }

  // Quando forçado, sobrescreve as instruções para garantir que o modelo
  // emita APENAS o JSON de diagnóstico, sem fazer mais perguntas.
  const instructions = isForcedClose
    ? `${AGATHA_SYSTEM_PROMPT}\n\n` +
      `⚠️ LIMITE ATINGIDO: o limite de ${SESSION_CONFIG.MAX_QUESTIONS} perguntas foi atingido. ` +
      `Você DEVE encerrar a entrevista AGORA e responder APENAS com o JSON de diagnóstico final. ` +
      `Nenhuma pergunta adicional. Nenhum texto fora do JSON.`
    : AGATHA_SYSTEM_PROMPT

  // 8. Streaming via OpenAI Responses API
  const stream = new ReadableStream({
    async start(controller) {
      let fullReply = ''
      let openaiError: string | null = null

      try {
        const openai = getOpenAIClient()

        const response = await openai.responses.create({
          model: 'gpt-4o-mini',
          instructions,
          input,
          max_output_tokens: isClosingTurn
            ? SESSION_CONFIG.MAX_TOKENS_PER_TURN * 2   // diagnóstico precisa de mais tokens
            : SESSION_CONFIG.MAX_TOKENS_PER_TURN,
          stream: true,
        })

        for await (const event of response) {
          if (event.type === 'response.output_text.delta') {
            fullReply += event.delta
            controller.enqueue(sseChunk({ chunk: event.delta }))
          }

          if (event.type === 'response.failed') {
            openaiError = event.response.error?.message ?? 'Erro desconhecido na OpenAI.'
            break
          }
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erro interno ao chamar a OpenAI.'
        console.error('[/api/chat] OpenAI error:', err)
        openaiError = message
      }

      // Tratar erro de stream
      if (openaiError) {
        controller.enqueue(sseChunk({ error: openaiError }))
        controller.close()
        return
      }

      // 9. Tentar parsear diagnóstico final
      const diagnosisData = parseDiagnosisJson(fullReply)
      const isDiagnosis = diagnosisData !== null

      console.log(
        `[/api/chat] Resposta recebida: isDiagnosis=${isDiagnosis} isForcedClose=${isForcedClose} length=${fullReply.length}`,
      )

      if (isForcedClose && !isDiagnosis) {
        console.error(
          `[/api/chat] ATENÇÃO: turno forçado mas modelo não gerou diagnóstico válido. Resposta: ${fullReply.slice(0, 200)}`,
        )
      }

      let savedShareToken: string | null = null

      if (isDiagnosis && diagnosisData) {
        console.log(`[/api/chat] Iniciando persistência do diagnóstico para sessionId=${sessionId}`)
        try {
          // Diagnóstico + encerramento de sessão em transação atômica:
          // se qualquer operação falhar, nenhuma é persistida.
          const saved = await prisma.$transaction(async (tx) => {
            const diagnosis = await tx.diagnosis.create({
              data: {
                sessionId,
                title: diagnosisData.diagnostico,
                description: diagnosisData.resumoAfetivo,
                prescription: diagnosisData.prescricao,
                archetypeTags: diagnosisData.sintomas,
                arquetipoCanino: diagnosisData.arquetipoCanino,
                nivelDrama: diagnosisData.nivelDrama,
                sintomas: diagnosisData.sintomas,
                fraseCompartilhavel: diagnosisData.fraseCompartilhavel,
                resumoAfetivo: diagnosisData.resumoAfetivo,
              },
              select: { shareToken: true },
            })

            await tx.session.update({
              where: { id: sessionId },
              data: { status: 'COMPLETED', endedAt: new Date() },
            })

            return diagnosis
          })

          savedShareToken = saved.shareToken
          console.log(`[/api/chat] Diagnóstico salvo: shareToken=${savedShareToken}`)
        } catch (dbErr) {
          console.error('[/api/chat] Erro na transação de diagnóstico:', dbErr)
        }
      }

      // 10. Persistir mensagem da Agatha + incrementar contador
      await Promise.all([
        prisma.message.create({
          data: {
            sessionId,
            turnNumber: turnNumber + 1,
            role: 'bot',
            content: fullReply,
          },
        }),
        prisma.session.update({
          where: { id: sessionId },
          data: { questionCount: { increment: 1 } },
        }),
      ])

      // 11. Sinal de fim — envia o payload do diagnóstico para o cliente
      controller.enqueue(
        sseChunk({
          done: true,
          isDiagnosis,
          ...(isDiagnosis && diagnosisData
            ? { diagnosis: diagnosisData, shareToken: savedShareToken }
            : {}),
        }),
      )
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
