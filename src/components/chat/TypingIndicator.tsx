import { AgathaAvatar } from './AgathaAvatar'

export function TypingIndicator() {
  return (
    <div className="flex items-end gap-2.5">
      <AgathaAvatar size="sm" pulse className="mb-1" />

      <div
        className="flex items-center gap-3 px-4 py-3 rounded-2xl rounded-bl-sm border border-white/10"
        style={{
          background: 'rgba(74,144,217,0.10)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Dots */}
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="block w-1.5 h-1.5 rounded-full bg-blue-400"
              style={{
                animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>

        <span
          className="text-xs italic"
          style={{ color: 'var(--text-secondary)' }}
        >
          Agatha está analisando humanos...
        </span>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
