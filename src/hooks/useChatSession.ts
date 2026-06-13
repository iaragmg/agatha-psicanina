'use client'

import { useState, useCallback, useRef } from 'react'

export interface Message {
  id: string
  role: 'user' | 'bot'
  content: string
  streaming?: boolean
  flagged?: boolean
}

export interface DiagnosisPayload {
  tipo: 'diagnostico'
  diagnostico: string
  arquetipoCanino: string
  nivelDrama: number
  sintomas: string[]
  prescricao: string
  fraseCompartilhavel: string
  resumoAfetivo: string
}

interface UseChatSessionReturn {
  messages: Message[]
  isLoading: boolean
  isTyping: boolean
  sessionId: string | null
  turnNumber: number
  diagnosis: DiagnosisPayload | null
  shareToken: string | null
  initSession: () => Promise<void>
  sendMessage: (content: string) => Promise<void>
}

export function useChatSession(): UseChatSessionReturn {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [turnNumber, setTurnNumber] = useState(1)
  const [diagnosis, setDiagnosis] = useState<DiagnosisPayload | null>(null)
  const [shareToken, setShareToken] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const addMessage = useCallback((msg: Omit<Message, 'id'>) => {
    const id = crypto.randomUUID()
    setMessages((prev) => [...prev, { ...msg, id }])
    return id
  }, [])

  const updateLastBotMessage = useCallback((content: string, done = false) => {
    setMessages((prev) => {
      const copy = [...prev]
      const last = copy[copy.length - 1]
      if (last?.role === 'bot') {
        copy[copy.length - 1] = { ...last, content, streaming: !done }
      }
      return copy
    })
  }, [])

  const initSession = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/chat/session', { method: 'POST' })
      const data = await res.json()
      setSessionId(data.sessionId)

      // Primeira mensagem da Agatha
      setIsTyping(true)
      const botId = addMessage({ role: 'bot', content: '', streaming: true })

      const msgRes = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: data.sessionId, turnNumber: 1, content: '__init__' }),
      })

      await readStream(msgRes, botId)
      setTurnNumber(2)
    } catch (err) {
      console.error('initSession error', err)
    } finally {
      setIsLoading(false)
      setIsTyping(false)
    }
  }, [addMessage]) // eslint-disable-line react-hooks/exhaustive-deps

  const readStream = useCallback(
    async (res: Response, botMsgId: string) => {
      const reader = res.body?.getReader()
      if (!reader) return

      const decoder = new TextDecoder()
      let buffer = ''
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const payload = JSON.parse(line.slice(6))

            if (payload.chunk) {
              accumulated += payload.chunk
              updateLastBotMessage(accumulated, false)
            }

            if (payload.done) {
              updateLastBotMessage(accumulated, true)

              if (payload.isDiagnosis && payload.diagnosis) {
                setDiagnosis(payload.diagnosis as DiagnosisPayload)
                if (payload.shareToken) setShareToken(payload.shareToken as string)
              }
            }

            if (payload.error) {
              updateLastBotMessage('🐾 Desculpe, tive uma falha na minha análise. Tente novamente.', true)
            }
          } catch {
            // linha malformada — ignora
          }
        }
      }
    },
    [updateLastBotMessage],
  )

  const sendMessage = useCallback(
    async (content: string) => {
      if (!sessionId || isLoading || !content.trim()) return

      abortRef.current?.abort()
      abortRef.current = new AbortController()

      // Mensagem do usuário
      addMessage({ role: 'user', content })
      setIsTyping(true)

      // Placeholder da Agatha
      addMessage({ role: 'bot', content: '', streaming: true })

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, turnNumber, content }),
          signal: abortRef.current.signal,
        })

        if (!res.ok) {
          const err = await res.json()
          updateLastBotMessage(err.error ?? 'Erro desconhecido', true)
          return
        }

        await readStream(res, '')
        setTurnNumber((n) => n + 2) // user + bot
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          updateLastBotMessage('🐾 Conexão interrompida. Tente novamente.', true)
        }
      } finally {
        setIsTyping(false)
      }
    },
    [sessionId, isLoading, turnNumber, addMessage, updateLastBotMessage, readStream],
  )

  return { messages, isLoading, isTyping, sessionId, turnNumber, diagnosis, shareToken, initSession, sendMessage }
}
