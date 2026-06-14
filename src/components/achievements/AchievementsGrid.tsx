'use client'

import { ACHIEVEMENTS, type AchievementCategory } from '@/lib/achievements'
import { AchievementCard } from './AchievementCard'

const CATEGORY_LABEL: Record<AchievementCategory, string> = {
  jornada:      '🛣️ Jornada',
  perfil:       '🐾 Perfil PsiCanino',
  drama:        '🎭 Drama',
  raridade:     '💎 Raridade',
  certificados: '📜 Certificados',
  secreta:      '🔮 Secreta',
}

interface Props {
  unlockedIds: string[]
}

export function AchievementsGrid({ unlockedIds }: Props) {
  const unlockedSet = new Set(unlockedIds)

  // Desbloqueadas primeiro (prestige desc), depois bloqueadas (prestige asc — mais fáceis por vir)
  const sorted = [
    ...ACHIEVEMENTS
      .filter((a) => unlockedSet.has(a.id))
      .sort((a, b) => b.prestige - a.prestige),
    ...ACHIEVEMENTS
      .filter((a) => !unlockedSet.has(a.id))
      .sort((a, b) => a.prestige - b.prestige),
  ]

  const unlockedCount = unlockedSet.size
  const total = ACHIEVEMENTS.length

  // Categorias presentes nas conquistas visíveis, na ordem que aparecem
  const visibleCategories: AchievementCategory[] = []
  const seenCats = new Set<AchievementCategory>()
  for (const a of sorted) {
    if (!seenCats.has(a.category)) {
      visibleCategories.push(a.category)
      seenCats.add(a.category)
    }
  }

  return (
    <div>
      {/* Cabeçalho */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f0f0ff', margin: 0 }}>
          🏅 Minhas Conquistas
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

      {/* Grid agrupado por categoria */}
      {visibleCategories.map((cat) => {
        const items = sorted.filter((a) => a.category === cat)
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
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 10,
            }}>
              {items.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  isUnlocked={unlockedSet.has(achievement.id)}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
