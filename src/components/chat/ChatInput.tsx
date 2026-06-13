'use client'

import { useState, useRef, type KeyboardEvent, type FormEvent } from 'react'

interface ChatInputProps {
  onSend: (content: string) => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({ onSend, disabled, placeholder = 'Responda a Agatha...' }: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleSubmit(e?: FormEvent) {
    e?.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  function handleInput() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 140) + 'px'
  }

  const canSend = value.trim().length > 0 && !disabled

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3">
      <div
        className="flex-1 flex items-end gap-2 px-4 py-3 rounded-2xl border border-white/10 transition-colors focus-within:border-blue-500/50"
        style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)' }}
      >
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          disabled={disabled}
          placeholder={placeholder}
          className="flex-1 resize-none bg-transparent outline-none text-sm leading-relaxed placeholder:italic"
          style={{
            color: 'var(--text-primary)',
            maxHeight: '140px',
          }}
        />
      </div>

      <button
        type="submit"
        disabled={!canSend}
        className="w-11 h-11 flex items-center justify-center rounded-full shrink-0 transition-all active:scale-95"
        style={{
          background: canSend ? 'var(--accent-blue)' : 'rgba(255,255,255,0.08)',
          color: canSend ? '#fff' : 'rgba(255,255,255,0.3)',
          cursor: canSend ? 'pointer' : 'not-allowed',
        }}
        aria-label="Enviar mensagem"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </form>
  )
}
