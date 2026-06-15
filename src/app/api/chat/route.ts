import { NextRequest } from 'next/server'
import type { ResponseInput } from 'openai/resources/responses/responses'
import { getOpenAIClient } from '@/lib/openai'
import { prisma } from '@/lib/prisma'
import { buildInstructions } from '@/lib/agatha-prompt'
import { selectQuestionsForSession, countByCategory } from '@/lib/question-bank'
import { SENSITIVE_REDIRECT, SESSION_CONFIG } from '@/lib/constants'
import { createMessageSchema } from '@/lib/validations/session'
import { diagnosisJsonSchema, type DiagnosisJson } from '@/lib/validations/diagnosis'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { checkAchievements } from '@/lib/checkAchievements'

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
  console.log('[parseDiagnosis] Resposta bruta OpenAI (600 chars):', raw.slice(0, 600))

  // 1. Strip markdown code fences (```json ... ``` ou ``` ... ```)
  const stripped = raw
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim()

  if (stripped !== raw.trim()) {
    console.log('[parseDiagnosis] Markdown fence removido. Após strip:', stripped.slice(0, 300))
  }

  // 2. Extrair o objeto JSON: do primeiro { ao último }
  const match = stripped.match(/\{[\s\S]*\}/)
  if (!match) {
    console.error('[parseDiagnosis] Nenhum bloco JSON encontrado. Raw completo:', raw)
    return null
  }

  // 3. JSON.parse
  let json: unknown
  try {
    json = JSON.parse(match[0])
    console.log('[parseDiagnosis] JSON parseado:', JSON.stringify(json).slice(0, 600))
  } catch (err) {
    console.error('[parseDiagnosis] JSON.parse falhou:', err, '\nBloco:', match[0].slice(0, 400))
    return null
  }

  // 4. Validação Zod
  const result = diagnosisJsonSchema.safeParse(json)
  if (!result.success) {
    console.error('[parseDiagnosis] Zod falhou:',      JSON.stringify(result.error.issues, null, 2))
    console.error('[parseDiagnosis] JSON recebido:',   JSON.stringify(json, null, 2))
    console.error('[parseDiagnosis] Schema esperado:',
      'tipo("diagnostico") | diagnostico | arquetipoCanino | nivelDrama(int 1-10) |',
      'sintomas(string[]) | prescricao | fraseCompartilhavel | resumoAfetivo')
    return null
  }

  console.log('[parseDiagnosis] Válido — diagnostico:', result.data.diagnostico.slice(0, 60))
  return result.data
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
    include: {
      messages: { orderBy: { turnNumber: 'asc' } },
      patient: { select: { anonymousId: true } },
    },
  })

  if (!session) {
    return Response.json({ error: 'Sessão não encontrada.' }, { status: 404 })
  }
  if (session.status !== 'ACTIVE') {
    return Response.json({ error: 'Sessão já encerrada.' }, { status: 409 })
  }

  // Seleção determinística de perguntas para esta sessão (usa session.id como seed)
  const selectedQuestions = selectQuestionsForSession(session.id)
  const currentQuestion = selectedQuestions[session.questionCount] ?? null

  if (process.env.NODE_ENV === 'development') {
    console.log(
      `[question-bank] Perguntas selecionadas para sessão ${session.id}:`,
      selectedQuestions.map((q, i) => `[${i}] ${q.id} — ${q.text.slice(0, 60)}`),
    )
    console.log(
      `[question-bank] Turno atual: questionCount=${session.questionCount} → pergunta "${currentQuestion?.id ?? 'encerramento'}"`,
    )
  }

  console.log(
    `[/api/chat] sessionId=${sessionId} questionCount=${session.questionCount} MAX=${SESSION_CONFIG.MAX_QUESTIONS}`,
  )

  // Quando questionCount ultrapassa o limite verificamos se já existe diagnóstico.
  // Se existir → bloqueamos (sessão deveria ter sido marcada COMPLETED).
  // Se NÃO existir → geração anterior falhou; deixamos passar com isForcedClose=true
  // para tentar novamente em vez de prender o usuário para sempre.
  if (session.questionCount > SESSION_CONFIG.MAX_QUESTIONS) {
    const existingDiagnosis = await prisma.diagnosis.findFirst({
      where: { sessionId },
      select: { shareToken: true },
    })

    if (existingDiagnosis) {
      console.log(`[/api/chat] Existing diagnosis found (shareToken=${existingDiagnosis.shareToken}). Returning question limit message.`)
      return Response.json({ error: 'Limite de perguntas atingido.' }, { status: 422 })
    }

    // Diagnóstico ainda não foi salvo — tentativa anterior falhou no parse.
    console.log(
      `[/api/chat] MAX reached (questionCount=${session.questionCount}), no diagnosis saved yet — forcing diagnosis generation`,
    )
    // Continua com isForcedClose=true abaixo.
  }

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

  // Constrói instructions com pergunta atual injetada e, no encerramento,
  // o resumo de temas abordados para enriquecer o diagnóstico.
  const categoryCounts = isForcedClose
    ? countByCategory(selectedQuestions.slice(0, session.questionCount))
    : undefined

  const instructions = buildInstructions({
    currentQuestion: currentQuestion?.text,
    isForcedClose,
    categoryCounts,
  })

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
          console.log(`[/api/chat] Diagnosis persisted: shareToken=${savedShareToken}`)

          // Reconciliação de conquistas: fire-and-forget
          const anonymousId = session.patient?.anonymousId
          if (anonymousId) checkAchievements(anonymousId).catch(console.error)
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
