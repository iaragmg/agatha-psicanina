'use client'

import type { Achievement } from '@/lib/achievements'

const PRESTIGE_LABEL: Record<number, string> = {
  1: 'Comum', 2: 'Comum', 3: 'Incomum',
  4: 'Incomum', 5: 'Raro', 6: 'Raro',
  7: 'Épico', 8: 'Épico', 9: 'Lendário', 10: 'Lendário',
}
const PRESTIGE_COLOR: Record<number, string> = {
  1: 'rgba(160,160,180,0.55)', 2: 'rgba(160,160,180,0.55)', 3: 'rgba(100,200,120,0.65)',
  4: 'rgba(100,200,120,0.65)', 5: 'rgba(74,144,217,0.7)', 6: 'rgba(74,144,217,0.7)',
  7: 'rgba(155,89,182,0.8)', 8: 'rgba(155,89,182,0.8)', 9: '#e8c776', 10: '#e8c776',
}

interface Props {
  achievement: Achievement
  isUnlocked: boolean
}

export function AchievementCard({ achievement, isUnlocked }: Props) {
  const { emoji, title, description, lockedHint, prestige, secret } = achievement

  const prestigeLabel = PRESTIGE_LABEL[prestige] ?? 'Comum'
  const prestigeColor = PRESTIGE_COLOR[prestige] ?? 'rgba(160,160,180,0.55)'

  if (isUnlocked) {
    return (
      <div style={{
        position: 'relative',
        background: 'linear-gradient(145deg, rgba(26,18,50,0.95) 0%, rgba(32,20,58,0.95) 100%)',
        border: '1px solid rgba(201,168,76,0.3)',
        borderRadius: 14,
        padding: '14px 12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 8,
        boxShadow: '0 0 18px rgba(201,168,76,0.08), inset 0 0 0 1px rgba(201,168,76,0.08)',
      }}>
        {/* Glow dot top-right */}
        <div style={{
          position: 'absolute', top: 8, right: 8,
          width: 6, height: 6, borderRadius: '50%',
          background: '#e8c776',
          boxShadow: '0 0 6px rgba(232,199,118,0.8)',
        }} />

        {/* Emoji */}
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(201,168,76,0.18), rgba(155,89,182,0.12))',
          border: '1.5px solid rgba(201,168,76,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, lineHeight: 1,
          boxShadow: '0 2px 12px rgba(201,168,76,0.15)',
        }}>
          {emoji}
        </div>

        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#e8c776', margin: '0 0 3px', lineHeight: 1.3 }}>
            {title}
          </p>
          <p style={{ fontSize: 10, color: 'rgba(240,240,255,0.5)', margin: '0 0 5px', lineHeight: 1.4 }}>
            {description}
          </p>
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
            color: prestigeColor,
          }}>
            {prestigeLabel}
          </span>
        </div>

        {/* Carimbo "OBTIDA" */}
        <div style={{
          fontSize: 8, fontWeight: 800, letterSpacing: '0.1em',
          color: 'rgba(201,168,76,0.55)', textTransform: 'uppercase',
        }}>
          ✦ obtida ✦
        </div>
      </div>
    )
  }

  // Estado bloqueado — conquista secreta oculta título e emoji
  const isSecret = secret === true
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 14,
      padding: '14px 12px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      gap: 8,
      opacity: 0.6,
    }}>
      {/* Emoji — oculto se secreta */}
      <div style={{
        width: 48, height: 48, borderRadius: '50%',
        background: 'rgba(255,255,255,0.04)',
        border: '1.5px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, lineHeight: 1,
        filter: 'grayscale(1)',
      }}>
        {isSecret ? '🔒' : emoji}
      </div>

      <div>
        <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(240,240,255,0.35)', margin: '0 0 4px', lineHeight: 1.3 }}>
          {isSecret ? '????' : title}
        </p>
        <p style={{ fontSize: 10, color: 'rgba(240,240,255,0.22)', margin: 0, lineHeight: 1.4 }}>
          {isSecret ? lockedHint : `🔒 ${lockedHint}`}
        </p>
      </div>
    </div>
  )
}
