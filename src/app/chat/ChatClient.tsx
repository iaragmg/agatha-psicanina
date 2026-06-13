'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useChatSession } from '@/hooks/useChatSession'
import {
  ChatHeader,
  ChatBubble,
  ChatInput,
  DiagnosisCard,
  TypingIndicator,
} from '@/components/chat'
import { SESSION_CONFIG } from '@/lib/constants'

export function ChatClient() {
  const {
    messages,
    isTyping,
    sessionId,
    turnNumber,
    diagnosis,
    shareToken,
    initSession,
    sendMessage,
  } = useChatSession()

  const bottomRef = useRef<HTMLDivElement>(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    initSession()
  }, [initSession])

  // Auto-scroll suave ao fim
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const questionCount = Math.max(0, Math.floor((turnNumber - 2) / 2))

  const handleRestart = useCallback(() => {
    initialized.current = false
    window.location.reload()
  }, [])

  const isDone = !!diagnosis

  return (
    <div
      className="flex flex-col h-screen max-w-2xl mx-auto"
      style={{ color: 'var(--text-primary)' }}
    >
      {/* Header fixo */}
      <ChatHeader
        questionCount={questionCount}
        maxQuestions={SESSION_CONFIG.MAX_QUESTIONS}
        isTyping={isTyping}
      />

      {/* Área de mensagens */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        {/* Disclaimer fixo no topo */}
        {messages.length === 0 && !sessionId && (
          <div
            className="mx-auto max-w-sm text-center text-xs px-4 py-3 rounded-xl border"
            style={{
              background: 'rgba(255,200,50,0.06)',
              borderColor: 'rgba(255,200,50,0.2)',
              color: 'var(--text-secondary)',
            }}
          >
            ⚠️ <strong style={{ color: 'var(--text-primary)' }}>Entretenimento.</strong>{' '}
            Não é psicologia real. CVV: <strong style={{ color: 'var(--text-primary)' }}>188</strong>
          </div>
        )}

        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}

        {isTyping && messages[messages.length - 1]?.role !== 'bot' && (
          <TypingIndicator />
        )}

        {/* Card de diagnóstico */}
        {diagnosis && (
          <DiagnosisCard diagnosis={diagnosis} onRestart={handleRestart} shareToken={shareToken} />
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {!isDone && (
        <div
          className="px-4 py-4 border-t border-white/8"
          style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(16px)' }}
        >
          <ChatInput
            onSend={sendMessage}
            disabled={isTyping || !sessionId}
            placeholder={isTyping ? 'Aguarde a Agatha...' : 'Responda a Agatha...'}
          />
          <p
            className="text-center text-[10px] mt-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            Enter para enviar · Shift+Enter para nova linha
          </p>
        </div>
      )}
    </div>
  )
}
