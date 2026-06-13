import { NextRequest } from 'next/server'
import type { ResponseInput } from 'openai/resources/responses/responses'
import { getOpenAIClient } from '@/lib/openai'
import { prisma } from '@/lib/prisma'
import { AGATHA_SYSTEM_PROMPT } from '@/lib/agatha-prompt'
import { SENSITIVE_REDIRECT, SESSION_CONFIG } from '@/lib/constants'
import { createMessageSchema } from '@/lib/validations/session'
import { diagnosisJsonSchema, type DiagnosisJson } from '@/lib/validations/diagnosis'

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
  // 1. Parse e validação do body
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
  if (session.questionCount >= SESSION_CONFIG.MAX_QUESTIONS) {
    return Response.json({ error: 'Limite de perguntas atingido.' }, { status: 422 })
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
  // questionCount já inclui a pergunta atual após o increment no passo 10
  const nextQuestionCount = session.questionCount + 1
  const isClosingTurn = nextQuestionCount >= SESSION_CONFIG.MIN_QUESTIONS

  // 8. Streaming via OpenAI Responses API
  const stream = new ReadableStream({
    async start(controller) {
      let fullReply = ''
      let openaiError: string | null = null

      try {
        const openai = getOpenAIClient()

        const response = await openai.responses.create({
          model: 'gpt-4o-mini',
          instructions: AGATHA_SYSTEM_PROMPT,
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

      if (isDiagnosis && diagnosisData) {
        try {
          // Persistir Diagnosis com todos os campos estruturados
          await prisma.diagnosis.create({
            data: {
              sessionId,
              // Campos legados (mantidos por compatibilidade)
              title: diagnosisData.diagnostico,
              description: diagnosisData.resumoAfetivo,
              prescription: diagnosisData.prescricao,
              archetypeTags: diagnosisData.sintomas,
              // Novos campos
              arquetipoCanino: diagnosisData.arquetipoCanino,
              nivelDrama: diagnosisData.nivelDrama,
              sintomas: diagnosisData.sintomas,
              fraseCompartilhavel: diagnosisData.fraseCompartilhavel,
              resumoAfetivo: diagnosisData.resumoAfetivo,
            },
          })

          await prisma.session.update({
            where: { id: sessionId },
            data: { status: 'COMPLETED', endedAt: new Date() },
          })
        } catch (dbErr) {
          console.error('[/api/chat] Erro ao persistir diagnóstico:', dbErr)
          // Não aborta o stream — o usuário já viu a resposta
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
          ...(isDiagnosis && diagnosisData ? { diagnosis: diagnosisData } : {}),
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
