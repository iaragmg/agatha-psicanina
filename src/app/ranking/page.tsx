export const revalidate = 60

import Link from 'next/link'
import {
  getClinicStats,
  getTopArchetypes,
  getRareArchetypes,
  getPaoDeQueijo,
  getRarityDistribution,
  getDramaRanking,
  getInsights,
  getTopAchievements,
} from '@/lib/ranking-analytics'

// ─── i18n ─────────────────────────────────────────────────────────────────────

const TEXTS = {
  nav:              '← Voltar para a clínica',
  hero_tag:         '✦ O Grande Mural da Clínica',
  hero_title:       'Ranking PsiCanino',
  hero_sub:         'Dados reais. Pacientes certificados. Dramas catalogados.',
  hero_revalidate:  'Atualizado a cada 60 s',

  stats_tag:        '✦ Estatísticas da Clínica',
  stats_sessions:   'Consultas concluídas',
  stats_certs:      'Certificados emitidos',
  stats_drama:      'Drama médio',
  stats_pao:        'Compatibilidade média com pão de queijo',
  stats_archetypes: 'Arquétipos únicos catalogados',
  stats_achieve:    'Conquistas desbloqueadas',

  top_tag:          '✦ Arquétipos Mais Comuns',
  top_title:        'Top 10 Arquétipos',
  top_empty:        'Nenhum diagnóstico certificado ainda.',

  rare_tag:         '✦ Casos Únicos',
  rare_title:       'Arquétipos Raros',
  rare_sub:         'Apareceram apenas uma vez na história da clínica.',
  rare_empty:       'Nenhum arquétipo raro encontrado.',

  pao_tag:          '✦ Hall da Fama do Pão de Queijo',
  pao_title:        'Quem mais ama pão de queijo?',
  pao_sub:          'Média de compatibilidade por arquétipo canino.',
  pao_empty:        'Dados insuficientes.',

  rarity_tag:       '✦ Distribuição de Raridades',
  rarity_title:     'Raridades da Clínica',
  rarity_empty:     'Sem certificados emitidos ainda.',

  drama_tag:        '✦ Casos Mais Dramáticos',
  drama_title:      'Ranking de Drama',
  drama_sub:        'Os 10 pacientes que mais preocuparam a Dra. Agatha.',
  drama_empty:      'Nenhum paciente certificado ainda.',
  drama_label:      'Nível de Drama',

  insights_tag:     '✦ Perspectivas Clínicas',
  insights_title:   'Agatha Insights',

  achieve_tag:      '✦ Hall of Champions',
  achieve_title:    'Conquistas Mais Desbloqueadas',
  achieve_empty:    'Nenhuma conquista desbloqueada ainda.',
  achieve_vezes:    'vez',
  achieve_vezesP:   'vezes',

  cta_tag:          '✦ Pronto para entrar no mural?',
  cta_title:        'Marque sua consulta',
  cta_sub:          'Só pacientes certificados aparecem aqui. O diagnóstico leva menos de 5 minutos.',
  cta_btn:          'Iniciar Consulta Gratuita',
  cta_btn2:         'Ver meu prontuário',
}

// ─── Rarity display ──────────────────────────────────────────────────────────

const RARITY_META: Record<string, { emoji: string; color: string; stars: string; label: string }> = {
  COMUM:    { emoji: '🔮', color: '#8e99a4', stars: '⭐⭐⭐',      label: 'Comum'    },
  RARO:     { emoji: '💎', color: '#4a90d9', stars: '⭐⭐⭐⭐',    label: 'Raro'     },
  EPICO:    { emoji: '💜', color: '#c39bd3', stars: '⭐⭐⭐⭐⭐',  label: 'Épico'    },
  LENDARIO: { emoji: '👑', color: '#e8c776', stars: '⭐⭐⭐⭐⭐⭐',label: 'Lendário' },
}

// ─── Shared style tokens ─────────────────────────────────────────────────────

const S = {
  card: {
    background: 'linear-gradient(145deg, rgba(19,13,38,0.92) 0%, rgba(26,14,50,0.92) 100%)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: '20px 22px',
  } as React.CSSProperties,
  sectionLabel: {
    fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: 'rgba(201,168,76,0.55)',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 22, fontWeight: 800, color: '#f0f0ff', margin: '0 0 6px',
  } as React.CSSProperties,
  sectionSub: {
    fontSize: 13, color: 'rgba(240,240,255,0.4)', margin: '0 0 20px',
  } as React.CSSProperties,
  gold: { color: '#e8c776' } as React.CSSProperties,
  muted: { color: 'rgba(240,240,255,0.35)' } as React.CSSProperties,
}

// ─── Sub-components ──────────────────────────────────────────────────────────

import type React from 'react'

function Section({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <section id={id} style={{ marginBottom: 48 }}>
      {children}
    </section>
  )
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{ ...S.card, textAlign: 'center', flex: '1 1 140px' }}>
      <div style={{ fontSize: 26, fontWeight: 800, color: '#e8c776', lineHeight: 1.1 }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: 'rgba(240,240,255,0.55)', marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'rgba(240,240,255,0.28)', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function RankingPage() {
  const [
    stats,
    topArchetypes,
    rareArchetypes,
    paoDeQueijo,
    rarityDist,
    dramaRanking,
    insights,
    topAchievements,
  ] = await Promise.all([
    getClinicStats(),
    getTopArchetypes(10),
    getRareArchetypes(10),
    getPaoDeQueijo(8),
    getRarityDistribution(),
    getDramaRanking(10),
    getInsights(),
    getTopAchievements(6),
  ])

  const maxTopCount = topArchetypes[0]?.count ?? 1

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0d0d1a 0%, #130d26 50%, #0d0d1a 100%)',
        padding: '32px 16px 64px',
        fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)',
        color: '#f0f0ff',
      }}
    >
      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        {/* Nav */}
        <Link
          href="/"
          style={{
            display: 'inline-block', fontSize: 13,
            color: 'rgba(74,144,217,0.7)', textDecoration: 'none',
            marginBottom: 32,
          }}
        >
          {TEXTS.nav}
        </Link>

        {/* ── Hero ──────────────────────────────────────────────────── */}
        <Section>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontSize: 56, lineHeight: 1, marginBottom: 12 }}>🏆</div>
            <div style={S.sectionLabel}>{TEXTS.hero_tag}</div>
            <h1 style={{ fontSize: 36, fontWeight: 900, color: '#f0f0ff', margin: '8px 0 10px' }}>
              {TEXTS.hero_title}
            </h1>
            <p style={{ fontSize: 15, color: 'rgba(240,240,255,0.45)', margin: '0 0 10px' }}>
              {TEXTS.hero_sub}
            </p>
            <span style={{ fontSize: 11, color: 'rgba(201,168,76,0.4)', letterSpacing: '0.08em' }}>
              🔄 {TEXTS.hero_revalidate}
            </span>
          </div>
        </Section>

        {/* ── Clinic Stats ──────────────────────────────────────────── */}
        <Section id="stats">
          <div style={S.sectionLabel}>{TEXTS.stats_tag}</div>
          <h2 style={S.sectionTitle}></h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 16 }}>
            <StatCard label={TEXTS.stats_sessions}   value={stats.totalSessions} />
            <StatCard label={TEXTS.stats_certs}      value={stats.totalCertificates} />
            <StatCard label={TEXTS.stats_drama}      value={`${stats.avgDrama}/10`} />
            <StatCard label={TEXTS.stats_pao}        value={`${stats.avgPaoDeQueijo}%`} />
            <StatCard label={TEXTS.stats_archetypes} value={stats.totalUniqueArchetypes} />
            <StatCard label={TEXTS.stats_achieve}    value={stats.totalAchievementsUnlocked} />
          </div>
        </Section>

        {/* ── Top Archetypes ────────────────────────────────────────── */}
        <Section id="top-archetypes">
          <div style={S.sectionLabel}>{TEXTS.top_tag}</div>
          <h2 style={S.sectionTitle}>{TEXTS.top_title}</h2>

          {topArchetypes.length === 0 ? (
            <p style={S.muted}>{TEXTS.top_empty}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {topArchetypes.map((a, i) => {
                const barPct = Math.round((a.count / maxTopCount) * 100)
                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`
                return (
                  <div key={a.name} style={S.card}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#f0f0ff' }}>
                        <span style={{ marginRight: 8 }}>{medal}</span>{a.name}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 700, ...S.gold }}>{a.count}</span>
                    </div>
                    {/* bar chart */}
                    <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%', borderRadius: 3,
                          width: `${barPct}%`,
                          background: i === 0
                            ? 'linear-gradient(90deg, #e8c776, #c9a84c)'
                            : 'linear-gradient(90deg, rgba(74,144,217,0.7), rgba(155,89,182,0.7))',
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Section>

        {/* ── Rare Archetypes ───────────────────────────────────────── */}
        <Section id="rare">
          <div style={S.sectionLabel}>{TEXTS.rare_tag}</div>
          <h2 style={S.sectionTitle}>{TEXTS.rare_title}</h2>
          <p style={S.sectionSub}>{TEXTS.rare_sub}</p>

          {rareArchetypes.length === 0 ? (
            <p style={S.muted}>{TEXTS.rare_empty}</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {rareArchetypes.map((a) => (
                <div
                  key={a.name}
                  style={{
                    ...S.card,
                    padding: '12px 16px',
                    border: '1px solid rgba(201,168,76,0.2)',
                    display: 'flex', flexDirection: 'column', gap: 4,
                  }}
                >
                  <span style={{ fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.45)' }}>
                    ✦ único
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#f0f0ff' }}>{a.name}</span>
                  <span style={{ fontSize: 11, color: 'rgba(240,240,255,0.3)' }}>
                    {a.createdAt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* ── Pão de Queijo ─────────────────────────────────────────── */}
        <Section id="pao">
          <div style={S.sectionLabel}>{TEXTS.pao_tag}</div>
          <h2 style={S.sectionTitle}>{TEXTS.pao_title}</h2>
          <p style={S.sectionSub}>{TEXTS.pao_sub}</p>

          {paoDeQueijo.length === 0 ? (
            <p style={S.muted}>{TEXTS.pao_empty}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {paoDeQueijo.map((e, i) => (
                <div key={e.arquetipoCanino} style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ fontSize: 20, minWidth: 28 }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🥐'}
                  </span>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: '#f0f0ff' }}>
                    {e.arquetipoCanino}
                  </span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: '#e8c776' }}>{e.avgPao}%</span>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* ── Rarity Distribution ───────────────────────────────────── */}
        <Section id="raridades">
          <div style={S.sectionLabel}>{TEXTS.rarity_tag}</div>
          <h2 style={S.sectionTitle}>{TEXTS.rarity_title}</h2>

          {rarityDist.length === 0 ? (
            <p style={S.muted}>{TEXTS.rarity_empty}</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {rarityDist.map((r) => {
                const meta = RARITY_META[r.rarity] ?? { emoji: '🔮', color: '#8e99a4', stars: '', label: r.rarity }
                return (
                  <div
                    key={r.rarity}
                    style={{
                      ...S.card,
                      flex: '1 1 140px',
                      border: `1px solid ${meta.color}30`,
                      textAlign: 'center',
                      boxShadow: `0 0 20px ${meta.color}15`,
                    }}
                  >
                    <div style={{ fontSize: 28, marginBottom: 4 }}>{meta.emoji}</div>
                    <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: meta.color, marginBottom: 4 }}>
                      {meta.label}
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: meta.color }}>{r.count}</div>
                    <div style={{ fontSize: 11, color: 'rgba(240,240,255,0.3)', marginTop: 2 }}>{r.percent}%</div>
                    <div style={{ fontSize: 10, marginTop: 4 }}>{meta.stars}</div>
                  </div>
                )
              })}
            </div>
          )}
        </Section>

        {/* ── Drama Ranking ─────────────────────────────────────────── */}
        <Section id="drama">
          <div style={S.sectionLabel}>{TEXTS.drama_tag}</div>
          <h2 style={S.sectionTitle}>{TEXTS.drama_title}</h2>
          <p style={S.sectionSub}>{TEXTS.drama_sub}</p>

          {dramaRanking.length === 0 ? (
            <p style={S.muted}>{TEXTS.drama_empty}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {dramaRanking.map((d, i) => {
                const dramaColor =
                  d.nivelDrama >= 9 ? '#e8c776'
                  : d.nivelDrama >= 7 ? '#c39bd3'
                  : d.nivelDrama >= 5 ? '#4a90d9'
                  : 'rgba(240,240,255,0.5)'

                return (
                  <div key={`${d.arquetipoCanino}-${i}`} style={S.card}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#f0f0ff' }}>
                          {i === 0 ? '🎭 ' : `${i + 1}. `}{d.arquetipoCanino}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                        <div style={{ fontSize: 11, color: 'rgba(240,240,255,0.35)' }}>{TEXTS.drama_label}</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: dramaColor }}>
                          {d.nivelDrama}/10
                        </div>
                      </div>
                    </div>
                    {d.fraseCompartilhavel && (
                      <p style={{
                        fontSize: 12, color: 'rgba(240,240,255,0.5)',
                        margin: 0, fontStyle: 'italic', lineHeight: 1.6,
                        borderLeft: `2px solid ${dramaColor}40`,
                        paddingLeft: 10,
                      }}>
                        "{d.fraseCompartilhavel}"
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </Section>

        {/* ── Agatha Insights ───────────────────────────────────────── */}
        <Section id="insights">
          <div style={S.sectionLabel}>{TEXTS.insights_tag}</div>
          <h2 style={S.sectionTitle}>{TEXTS.insights_title}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {insights.map((ins, i) => (
              <div
                key={i}
                style={{
                  ...S.card,
                  display: 'flex', alignItems: 'flex-start', gap: 14,
                  border: '1px solid rgba(155,89,182,0.2)',
                }}
              >
                <span style={{ fontSize: 24, flexShrink: 0 }}>{ins.emoji}</span>
                <p style={{ margin: 0, fontSize: 14, color: 'rgba(240,240,255,0.75)', lineHeight: 1.7 }}>
                  {ins.text}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Hall of Champions ─────────────────────────────────────── */}
        <Section id="conquistas">
          <div style={S.sectionLabel}>{TEXTS.achieve_tag}</div>
          <h2 style={S.sectionTitle}>{TEXTS.achieve_title}</h2>

          {topAchievements.length === 0 ? (
            <p style={S.muted}>{TEXTS.achieve_empty}</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {topAchievements.map((a, i) => (
                <div
                  key={a.id}
                  style={{
                    ...S.card,
                    flex: '1 1 180px',
                    border: i === 0 ? '1px solid rgba(232,199,118,0.35)' : '1px solid rgba(255,255,255,0.07)',
                    boxShadow: i === 0 ? '0 0 24px rgba(232,199,118,0.1)' : 'none',
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{a.emoji}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#f0f0ff', marginBottom: 4 }}>
                    {a.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(201,168,76,0.6)' }}>
                    {a.count} {a.count === 1 ? TEXTS.achieve_vezes : TEXTS.achieve_vezesP}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* ── CTA ───────────────────────────────────────────────────── */}
        <Section id="cta">
          <div
            style={{
              ...S.card,
              textAlign: 'center',
              padding: '40px 28px',
              background: 'linear-gradient(145deg, rgba(74,144,217,0.08) 0%, rgba(155,89,182,0.12) 100%)',
              border: '1px solid rgba(155,89,182,0.25)',
              boxShadow: '0 0 60px rgba(74,144,217,0.06)',
            }}
          >
            <div style={S.sectionLabel}>{TEXTS.cta_tag}</div>
            <h2 style={{ ...S.sectionTitle, fontSize: 26, marginTop: 8 }}>{TEXTS.cta_title}</h2>
            <p style={{ fontSize: 14, color: 'rgba(240,240,255,0.5)', margin: '0 0 28px', lineHeight: 1.7 }}>
              {TEXTS.cta_sub}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 320, margin: '0 auto' }}>
              <Link
                href="/chat"
                style={{
                  display: 'block', padding: '14px',
                  borderRadius: 14, fontSize: 15, fontWeight: 700, color: '#fff',
                  background: 'linear-gradient(135deg, rgba(74,144,217,0.9), rgba(155,89,182,0.9))',
                  boxShadow: '0 4px 20px rgba(74,144,217,0.22)',
                  textDecoration: 'none',
                }}
              >
                {TEXTS.cta_btn}
              </Link>
              <Link
                href="/prontuario"
                style={{
                  display: 'block', padding: '13px',
                  borderRadius: 14,
                  border: '1.5px solid rgba(155,89,182,0.4)',
                  fontSize: 14, fontWeight: 600,
                  color: 'rgba(195,155,211,0.9)',
                  background: 'rgba(155,89,182,0.06)',
                  textDecoration: 'none',
                }}
              >
                {TEXTS.cta_btn2}
              </Link>
            </div>
          </div>
        </Section>

      </div>
    </main>
  )
}
