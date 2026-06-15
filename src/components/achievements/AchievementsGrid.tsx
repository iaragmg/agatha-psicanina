'use client'

import { useState } from 'react'
import { ACHIEVEMENTS, type Achievement, type AchievementCategory } from '@/lib/achievements'
import { AchievementCard } from './AchievementCard'

const CATEGORY_LABEL: Record<AchievementCategory, string> = {
  jornada:      '🛣️ Jornada',
  certificados: '📜 Certificados',
  raridade:     '💎 Raridade',
  perfil:       '🐾 Perfil PsiCanino',
}

// Ordem de exibição das categorias
const CATEGORY_ORDER: AchievementCategory[] = ['jornada', 'certificados', 'raridade', 'perfil']

const PRESTIGE_LABEL: Record<number, string> = {
  1: 'Comum',   2: 'Comum',
  3: 'Incomum', 4: 'Incomum',
  5: 'Raro',    6: 'Raro',
  7: 'Épico',   8: 'Épico',
  9: 'Lendário', 10: 'Lendário',
}
const PRESTIGE_COLOR: Record<number, string> = {
  1: 'rgba(160,160,180,0.6)', 2: 'rgba(160,160,180,0.6)',
  3: 'rgba(100,200,120,0.75)', 4: 'rgba(100,200,120,0.75)',
  5: 'rgba(74,144,217,0.85)', 6: 'rgba(74,144,217,0.85)',
  7: 'rgba(155,89,182,0.9)', 8: 'rgba(155,89,182,0.9)',
  9: '#e8c776', 10: '#e8c776',
}

interface Props {
  unlockedIds: string[]
}

export function AchievementsGrid({ unlockedIds }: Props) {
  const unlockedSet = new Set(unlockedIds)
  const [selected, setSelected] = useState<{ achievement: Achievement; isUnlocked: boolean } | null>(null)

  const unlockedCount = unlockedSet.size
  const total = ACHIEVEMENTS.length

  return (
    <>
      {/* ── Modal de detalhes ──────────────────────────────────────────────────── */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(10,7,26,0.82)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 360,
              background: 'linear-gradient(145deg, #13102b 0%, #1a1040 100%)',
              border: selected.isUnlocked
                ? '1px solid rgba(201,168,76,0.4)'
                : '1px solid rgba(255,255,255,0.1)',
              borderRadius: 20,
              padding: '28px 24px',
              textAlign: 'center',
              boxShadow: selected.isUnlocked
                ? '0 0 40px rgba(201,168,76,0.15), 0 20px 60px rgba(0,0,0,0.6)'
                : '0 20px 60px rgba(0,0,0,0.6)',
            }}
          >
            {/* Emoji */}
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: selected.isUnlocked
                ? 'linear-gradient(135deg, rgba(201,168,76,0.2), rgba(155,89,182,0.15))'
                : 'rgba(255,255,255,0.04)',
              border: selected.isUnlocked
                ? '2px solid rgba(201,168,76,0.4)'
                : '2px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 36, lineHeight: 1,
              margin: '0 auto 16px',
              filter: selected.isUnlocked ? 'none' : 'grayscale(1)',
              boxShadow: selected.isUnlocked ? '0 0 24px rgba(201,168,76,0.2)' : 'none',
            }}>
              {selected.achievement.secret && !selected.isUnlocked ? '🔒' : selected.achievement.emoji}
            </div>

            {/* Título */}
            <h3 style={{
              fontSize: 18, fontWeight: 800,
              color: selected.isUnlocked ? '#e8c776' : 'rgba(240,240,255,0.4)',
              margin: '0 0 4px',
            }}>
              {selected.achievement.secret && !selected.isUnlocked
                ? '????' : selected.achievement.title}
            </h3>

            {/* Badge de prestige */}
            <span style={{
              display: 'inline-block',
              fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
              color: selected.isUnlocked
                ? (PRESTIGE_COLOR[selected.achievement.prestige] ?? 'rgba(160,160,180,0.6)')
                : 'rgba(255,255,255,0.2)',
              marginBottom: 16,
            }}>
              {PRESTIGE_LABEL[selected.achievement.prestige] ?? 'Comum'}
            </span>

            {/* Descrição ou dica */}
            <p style={{
              fontSize: 13, lineHeight: 1.6,
              color: selected.isUnlocked ? 'rgba(240,240,255,0.75)' : 'rgba(240,240,255,0.38)',
              margin: '0 0 20px',
            }}>
              {selected.isUnlocked
                ? selected.achievement.description
                : `🔒 ${selected.achievement.lockedHint}`}
            </p>

            {/* Status */}
            {selected.isUnlocked ? (
              <div style={{
                fontSize: 11, fontWeight: 800, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: 'rgba(201,168,76,0.6)',
              }}>
                ✦ conquistada ✦
              </div>
            ) : (
              <div style={{
                fontSize: 11, color: 'rgba(240,240,255,0.2)',
                letterSpacing: '0.06em',
              }}>
                ainda bloqueada
              </div>
            )}

            {/* Fechar */}
            <button
              onClick={() => setSelected(null)}
              style={{
                marginTop: 20, padding: '8px 24px',
                borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)',
                background: 'transparent', cursor: 'pointer',
                fontSize: 12, color: 'rgba(240,240,255,0.35)',
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* ── Grid principal ─────────────────────────────────────────────────────── */}
      <div>
        {/* Cabeçalho */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f0f0ff', margin: 0 }}>
            🏅 Quadro de Honra PsiCanino
          </h2>
          <span style={{
            fontSize: 11, fontWeight: 600,
            color: unlockedCount > 0 ? '#e8c776' : 'rgba(240,240,255,0.3)',
            background: unlockedCount > 0 ? 'rgba(201,168,76,0.1)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${unlockedCount > 0 ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.07)'}`,
            borderRadius: 999, padding: '3px 10px', flexShrink: 0,
          }}>
            {unlockedCount}/{total}
          </span>
        </div>

        {/* Barra de progresso */}
        <div style={{
          height: 4, borderRadius: 999, background: 'rgba(255,255,255,0.06)',
          overflow: 'hidden', marginBottom: 20,
        }}>
          <div style={{
            width: `${(unlockedCount / total) * 100}%`,
            height: '100%', borderRadius: 999,
            background: 'linear-gradient(90deg, #9b59b6, #e8c776)',
            transition: 'width 0.5s ease',
          }} />
        </div>

        {/* Grid por categoria — 3 cols mobile / 6 cols md */}
        {CATEGORY_ORDER.map((cat) => {
          const items = ACHIEVEMENTS.filter((a) => a.category === cat)
          if (items.length === 0) return null
          return (
            <div key={cat} style={{ marginBottom: 24 }}>
              <p style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
                textTransform: 'uppercase', color: 'rgba(240,240,255,0.35)',
                margin: '0 0 10px',
              }}>
                {CATEGORY_LABEL[cat]}
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 8,
              }}>
                {items.map((achievement) => {
                  const isUnlocked = unlockedSet.has(achievement.id)
                  return (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                      isUnlocked={isUnlocked}
                      onClick={() => setSelected({ achievement, isUnlocked })}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
