import { AgathaAvatar } from './AgathaAvatar'

interface ChatHeaderProps {
  questionCount: number
  maxQuestions: number
  isTyping: boolean
}

export function ChatHeader({ questionCount, maxQuestions, isTyping }: ChatHeaderProps) {
  const progress = Math.min((questionCount / maxQuestions) * 100, 100)

  return (
    <div
      className="flex items-center gap-3 px-5 py-4 border-b border-white/8"
      style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)' }}
    >
      <AgathaAvatar size="md" pulse={isTyping} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h1 className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
            Agatha PsiCanina
          </h1>
          <span
            className="text-xs px-2 py-0.5 rounded-full border"
            style={{
              background: 'rgba(74,144,217,0.15)',
              borderColor: 'rgba(74,144,217,0.3)',
              color: 'var(--accent-blue)',
            }}
          >
            Entretenimento
          </span>
        </div>

        <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          {isTyping
            ? 'Analisando você com precisão científica duvidosa...'
            : 'Shih Tzu · Especialista em Comportamento Humano Bizarro'}
        </p>

        {questionCount > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, background: 'var(--accent-blue)' }}
              />
            </div>
            <span className="text-[10px] shrink-0" style={{ color: 'var(--text-secondary)' }}>
              {questionCount}/{maxQuestions}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
