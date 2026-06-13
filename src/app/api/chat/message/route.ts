import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/prisma'
import { AGATHA_SYSTEM_PROMPT, buildMessages } from '@/lib/agatha-prompt'
import { SENSITIVE_REDIRECT, SESSION_CONFIG } from '@/lib/constants'
import { createMessageSchema } from '@/lib/validations/session'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SENSITIVE_KEYWORDS = [
  'suicid', 'me matar', 'não quero viver', 'acabar com tudo',
  'me machucar', 'automutila', 'overdose',
]

function isSensitive(text: string): boolean {
  const lower = text.toLowerCase()
  return SENSITIVE_KEYWORDS.some((kw) => lower.includes(kw))
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validação
    const parsed = createMessageSchema.safeParse({
      sessionId: body.sessionId,
      turnNumber: body.turnNumber,
      role: 'user',
      content: body.content,
    })
    if (!parsed.success) {
      return Response.json({ error: 'Dados inválidos', issues: parsed.error.issues }, { status: 400 })
    }

    const { sessionId, turnNumber, content } = parsed.data

    // Verificar sessão ativa
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { messages: { orderBy: { turnNumber: 'asc' } } },
    })
    if (!session || session.status !== 'ACTIVE') {
      return Response.json({ error: 'Sessão inválida ou encerrada' }, { status: 404 })
    }

    // Limite de perguntas
    if (session.questionCount >= SESSION_CONFIG.MAX_QUESTIONS) {
      return Response.json({ error: 'Sessão encerrada' }, { status: 400 })
    }

    const flaggedSensitive = isSensitive(content)

    // Salvar mensagem do usuário
    await prisma.message.create({
      data: { sessionId, turnNumber, role: 'user', content, flaggedSensitive },
    })

    // Conteúdo sensível — redireciona sem chamar Claude
    if (flaggedSensitive) {
      const safeReply = SENSITIVE_REDIRECT.MESSAGE

      await prisma.message.create({
        data: { sessionId, turnNumber: turnNumber + 1, role: 'bot', content: safeReply },
      })

      return Response.json({ reply: safeReply, flagged: true })
    }

    // Montar histórico para Claude (exclui a mensagem do user que acabamos de salvar)
    const history = session.messages.map((m) => ({
      role: m.role === 'user' ? ('user' as const) : ('assistant' as const),
      content: m.content,
    }))

    const messages = buildMessages(history, content)

    // Chamar Claude com streaming
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        let fullReply = ''

        try {
          const claudeStream = anthropic.messages.stream({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: SESSION_CONFIG.MAX_TOKENS_PER_TURN,
            system: AGATHA_SYSTEM_PROMPT,
            messages,
          })

          for await (const event of claudeStream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              const chunk = event.delta.text
              fullReply += chunk
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`))
            }
          }

          // Detectar se é diagnóstico final
          let isDiagnosis = false
          try {
            const parsed = JSON.parse(fullReply.trim())
            if (parsed.tipo === 'diagnostico') {
              isDiagnosis = true
              // Persiste diagnóstico
              await prisma.diagnosis.create({
                data: {
                  sessionId,
                  title: parsed.titulo,
                  description: parsed.descricao,
                  prescription: parsed.prescricao,
                  archetypeTags: parsed.tags ?? [],
                },
              })
              await prisma.session.update({
                where: { id: sessionId },
                data: { status: 'COMPLETED', endedAt: new Date() },
              })
            }
          } catch {
            // não é JSON — resposta normal
          }

          // Salvar resposta da Agatha
          await prisma.message.create({
            data: {
              sessionId,
              turnNumber: turnNumber + 1,
              role: 'bot',
              content: fullReply,
            },
          })

          // Incrementar contador de perguntas
          await prisma.session.update({
            where: { id: sessionId },
            data: { questionCount: { increment: 1 } },
          })

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ done: true, isDiagnosis })}\n\n`),
          )
        } catch (err) {
          console.error('[Claude stream error]', err)
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: 'Erro ao conectar com a Agatha' })}\n\n`),
          )
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (err) {
    console.error('[POST /api/chat/message]', err)
    return Response.json({ error: 'Erro interno' }, { status: 500 })
  }
}
