'use client'

import { ACHIEVEMENTS } from '@/lib/achievements'
import { AchievementCard } from './AchievementCard'

interface Props {
  unlockedIds: string[]
}

export function AchievementsGrid({ unlockedIds }: Props) {
  const unlockedSet = new Set(unlockedIds)

  // Desbloqueadas primeiro, depois bloqueadas — dentro de cada grupo mantém a ordem do catálogo
  const sorted = [
    ...ACHIEVEMENTS.filter((a) => unlockedSet.has(a.id)),
    ...ACHIEVEMENTS.filter((a) => !unlockedSet.has(a.id)),
  ]

  const unlockedCount = unlockedSet.size
  const total = ACHIEVEMENTS.length

  return (
    <div>
      {/* Cabeçalho da seção */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f0f0ff', margin: 0 }}>
          🏅 Minhas Conquistas
        </h2>
        <span style={{
          fontSize: 11, fontWeight: 600, color: unlockedCount > 0 ? '#e8c776' : 'rgba(240,240,255,0.3)',
          background: unlockedCount > 0 ? 'rgba(201,168,76,0.1)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${unlockedCount > 0 ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.07)'}`,
          borderRadius: 999, padding: '3px 10px',
          flexShrink: 0,
        }}>
          {unlockedCount}/{total}
        </span>
      </div>

      {/* Barra de progresso geral */}
      <div style={{
        height: 4, borderRadius: 999,
        background: 'rgba(255,255,255,0.06)',
        overflow: 'hidden', marginBottom: 18,
      }}>
        <div style={{
          width: `${(unlockedCount / total) * 100}%`,
          height: '100%', borderRadius: 999,
          background: 'linear-gradient(90deg, #9b59b6, #e8c776)',
          transition: 'width 0.5s ease',
        }} />
      </div>

      {/* Grid responsivo */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 10,
      }}>
        {sorted.map((achievement) => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            isUnlocked={unlockedSet.has(achievement.id)}
          />
        ))}
      </div>
    </div>
  )
}
