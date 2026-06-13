import { cn } from '@/lib/utils'

interface AgathaAvatarProps {
  size?: 'sm' | 'md' | 'lg'
  pulse?: boolean
  className?: string
}

const sizes = {
  sm: 'w-8 h-8 text-lg',
  md: 'w-11 h-11 text-2xl',
  lg: 'w-16 h-16 text-4xl',
}

export function AgathaAvatar({ size = 'md', pulse = false, className }: AgathaAvatarProps) {
  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-full shrink-0',
        'border border-white/15',
        sizes[size],
        className,
      )}
      style={{
        background: 'linear-gradient(135deg, rgba(74,144,217,0.25) 0%, rgba(155,89,182,0.25) 100%)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <span role="img" aria-label="Agatha PsiCanina">🐾</span>

      {pulse && (
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0d0d1a]">
          <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
        </span>
      )}
    </div>
  )
}
