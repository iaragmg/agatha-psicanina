import { AgathaAvatar } from './AgathaAvatar'
import { cn } from '@/lib/utils'
import type { Message } from '@/hooks/useChatSession'

interface ChatBubbleProps {
  message: Message
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isBot = message.role === 'bot'

  if (isBot) {
    return (
      <div className="flex items-end gap-2.5 max-w-[85%]">
        <AgathaAvatar size="sm" className="mb-1" />

        <div className="flex flex-col gap-1">
          <div
            className={cn(
              'px-4 py-3 rounded-2xl rounded-bl-sm text-sm leading-relaxed',
              'border border-white/10',
              message.streaming && 'animate-pulse',
            )}
            style={{
              background: 'rgba(74,144,217,0.12)',
              backdropFilter: 'blur(12px)',
              color: 'var(--text-primary)',
            }}
          >
            {message.content || (
              <span style={{ color: 'var(--text-secondary)' }}>…</span>
            )}
            {message.streaming && message.content && (
              <span
                className="inline-block w-0.5 h-4 ml-0.5 bg-blue-400 animate-pulse align-middle rounded"
              />
            )}
          </div>

          {message.flagged && (
            <p className="text-xs px-1" style={{ color: 'var(--text-secondary)' }}>
              🐾 Agatha pausou a análise por sua segurança.
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-end max-w-[85%] ml-auto">
      <div
        className="px-4 py-3 rounded-2xl rounded-br-sm text-sm leading-relaxed border border-white/10"
        style={{
          background: 'rgba(155,89,182,0.18)',
          backdropFilter: 'blur(12px)',
          color: 'var(--text-primary)',
        }}
      >
        {message.content}
      </div>
    </div>
  )
}
