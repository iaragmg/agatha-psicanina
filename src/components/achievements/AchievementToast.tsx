'use client'

import { useEffect, useState } from 'react'
import type { Achievement } from '@/lib/achievements'

interface Props {
  achievement: Achievement
  onDismiss: () => void
}

export function AchievementToast({ achievement, onDismiss }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Força reflow antes de animar
    const show = requestAnimationFrame(() => setVisible(true))
    const hide = setTimeout(() => {
      setVisible(false)
      setTimeout(onDismiss, 400)
    }, 4000)
    return () => {
      cancelAnimationFrame(show)
      clearTimeout(hide)
    }
  }, [onDismiss])

  return (
    <>
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(16px) scale(0.96) }
          to   { opacity: 1; transform: translateY(0)   scale(1)    }
        }
        @keyframes toast-out {
          from { opacity: 1; transform: translateY(0)   scale(1)    }
          to   { opacity: 0; transform: translateY(8px)  scale(0.97) }
        }
      `}</style>

      <div
        role="status"
        aria-live="polite"
        style={{
          position: 'fixed',
          bottom: 28,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          animation: visible ? 'toast-in 0.35s ease both' : 'toast-out 0.35s ease both',
          maxWidth: 340,
          width: 'calc(100vw - 32px)',
        }}
      >
        <div style={{
          background: 'linear-gradient(135deg, rgba(26,14,50,0.98) 0%, rgba(38,20,68,0.98) 100%)',
          border: '1px solid rgba(201,168,76,0.4)',
          borderRadius: 16,
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,168,76,0.1)',
          backdropFilter: 'blur(20px)',
        }}>
          {/* Ícone */}
          <div style={{
            width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, rgba(201,168,76,0.2), rgba(155,89,182,0.15))',
            border: '1.5px solid rgba(201,168,76,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, lineHeight: 1,
            boxShadow: '0 0 16px rgba(201,168,76,0.2)',
          }}>
            {achievement.emoji}
          </div>

          {/* Texto */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#e8c776', margin: '0 0 2px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              🎉 Nova conquista desbloqueada!
            </p>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#f0f0ff', margin: '0 0 2px', lineHeight: 1.3 }}>
              {achievement.title}
            </p>
            <p style={{ fontSize: 11, color: 'rgba(240,240,255,0.45)', margin: 0, lineHeight: 1.3 }}>
              {achievement.description}
            </p>
          </div>

          {/* Fechar */}
          <button
            onClick={() => { setVisible(false); setTimeout(onDismiss, 400) }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(240,240,255,0.3)', fontSize: 16, lineHeight: 1,
              padding: 4, flexShrink: 0,
            }}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>
      </div>
    </>
  )
}
