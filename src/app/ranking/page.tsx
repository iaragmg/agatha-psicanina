export const revalidate = 60

import Link from 'next/link'
import type React from 'react'
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
  brand:            'Agatha PsiCanina',
  brand_sub:        'CRP-PET 0001',

  hero_tag:         '✦ O Grande Mural da Clínica',
  hero_title:       'Ranking PsiCanino',
  hero_sub:         'Dados reais. Pacientes certificados. Dramas catalogados.',
  hero_badge:       '🔄 Atualizado a cada 60 s',

  stats_tag:        '✦ Estatísticas da Clínica',
  stats_sessions:   'Consultas concluídas',
  stats_certs:      'Certificados emitidos',
  stats_drama:      'Drama médio',
  stats_pao:        'Compat. com pão de queijo',
  stats_archetypes: 'Arquétipos únicos',
  stats_achieve:    'Conquistas desbloqueadas',

  top_tag:          '✦ Arquétipos Mais Comuns',
  top_title:        'Top 10 Arquétipos',
  top_empty:        'Nenhum diagnóstico certificado ainda.',

  rare_tag:         '✦ Casos Únicos',
  rare_title:       'Arquétipos Raros',
  rare_sub:         'Apareceram apenas uma vez na história da clínica.',
  rare_empty:       'Nenhum arquétipo raro encontrado.',
  rare_badge:       '✦ único',

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
  drama_label:      'Drama',

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

// ─── Rarity meta ─────────────────────────────────────────────────────────────

const RARITY_META: Record<string, { emoji: string; color: string; stars: string; label: string }> = {
  COMUM:    { emoji: '🔮', color: '#8e99a4', stars: '⭐⭐⭐',      label: 'Comum'    },
  RARO:     { emoji: '💎', color: '#22d3ee', stars: '⭐⭐⭐⭐',    label: 'Raro'     },
  EPICO:    { emoji: '💜', color: '#c39bd3', stars: '⭐⭐⭐⭐⭐',  label: 'Épico'    },
  LENDARIO: { emoji: '👑', color: '#e8c776', stars: '⭐⭐⭐⭐⭐⭐',label: 'Lendário' },
}

// ─── Style tokens — paleta navy-teal da referência visual ───────────────────

const C = {
  // Fundos de card: navy escuro semi-transparente
  cardBg:    'rgba(6, 12, 28, 0.80)',
  cardBgAlt: 'rgba(6, 12, 28, 0.70)',
  // Bordas
  border:    'rgba(255, 255, 255, 0.08)',
  borderCyan:'rgba(0, 188, 212, 0.20)',
  borderGold:'rgba(201, 168, 76, 0.22)',
  // Acentos
  cyan:   '#22d3ee',
  gold:   '#e8c776',
  purple: 'rgba(195, 155, 211, 0.9)',
  muted:  'rgba(240, 240, 255, 0.35)',
  dim:    'rgba(240, 240, 255, 0.50)',
  // Glow label dourado
  labelGold: 'rgba(201, 168, 76, 0.55)',
}

const S = {
  card: {
    background: C.cardBg,
    border: `1px solid ${C.border}`,
    borderRadius: 16,
    padding: '20px 22px',
    backdropFilter: 'blur(20px)',
  } as React.CSSProperties,

  cardCyan: {
    background: C.cardBg,
    border: `1px solid ${C.borderCyan}`,
    borderRadius: 16,
    padding: '20px 22px',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 0 28px rgba(0,188,212,0.07)',
  } as React.CSSProperties,

  sectionLabel: {
    fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: C.labelGold,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 22, fontWeight: 800, color: '#f0f0ff', margin: '0 0 6px',
  } as React.CSSProperties,
  sectionSub: {
    fontSize: 13, color: C.dim, margin: '0 0 20px',
  } as React.CSSProperties,
  muted: { color: C.muted } as React.CSSProperties,
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ children, id }: { children: React.ReactNode; id?: string }) {
  return <section id={id} style={{ marginBottom: 52 }}>{children}</section>
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, accent = false }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div
      style={{
        ...S.card,
        textAlign: 'center', flex: '1 1 130px',
        border: accent ? `1px solid ${C.borderCyan}` : `1px solid ${C.border}`,
        boxShadow: accent ? '0 0 20px rgba(0,188,212,0.08)' : 'none',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {accent && (
        <div style={{
          position: 'absolute', top: -20, right: -20,
          width: 80, height: 80, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,188,212,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
      )}
      <div style={{ fontSize: 24, fontWeight: 900, color: accent ? C.cyan : C.gold, lineHeight: 1.1 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: C.dim, marginTop: 5, lineHeight: 1.4 }}>{label}</div>
    </div>
  )
}

// ─── Divider ─────────────────────────────────────────────────────────────────

function Divider() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      margin: '0 0 40px',
    }}>
      <div style={{ flex: 1, height: 1, background: 'rgba(0,188,212,0.10)' }} />
      <span style={{ fontSize: 10, color: 'rgba(0,188,212,0.25)', letterSpacing: '0.14em' }}>✦ ✦ ✦</span>
      <div style={{ flex: 1, height: 1, background: 'rgba(0,188,212,0.10)' }} />
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
        padding: '0 16px 72px',
        fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)',
        color: '#f0f0ff',
      }}
    >
      {/* ── Header branding ────────────────────────────────────── */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 8px 0',
        maxWidth: 760, margin: '0 auto 40px',
      }}>
        {/* Logo — topo esquerdo, estilo referência visual */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,188,212,0.2) 0%, rgba(124,58,237,0.2) 100%)',
            border: '1.5px solid rgba(0,188,212,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 17,
          }}>
            🐾
          </div>
          <div>
            <div style={{
              fontSize: 16, fontWeight: 800, letterSpacing: '-0.01em',
              background: `linear-gradient(90deg, ${C.cyan}, rgba(195,155,211,0.9))`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              {TEXTS.brand}
            </div>
            <div style={{ fontSize: 9, color: C.labelGold, letterSpacing: '0.1em', fontWeight: 600 }}>
              {TEXTS.brand_sub}
            </div>
          </div>
        </div>

        {/* Nav link */}
        <Link
          href="/"
          style={{
            fontSize: 12, color: 'rgba(34,211,238,0.6)',
            textDecoration: 'none', letterSpacing: '0.02em',
          }}
        >
          {TEXTS.nav}
        </Link>
      </header>

      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        {/* ── Hero ──────────────────────────────────────────────── */}
        <Section>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            {/* Anel decorativo */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 80, height: 80, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0,188,212,0.15) 0%, rgba(124,58,237,0.12) 100%)',
              border: '2px solid rgba(0,188,212,0.25)',
              boxShadow: '0 0 40px rgba(0,188,212,0.12)',
              fontSize: 38, marginBottom: 20,
            }}>
              🏆
            </div>

            <div style={S.sectionLabel}>{TEXTS.hero_tag}</div>
            <h1 style={{
              fontSize: 'clamp(28px, 6vw, 40px)',
              fontWeight: 900, color: '#f0f0ff',
              margin: '10px 0 12px', lineHeight: 1.15,
            }}>
              {TEXTS.hero_title}
            </h1>
            <p style={{ fontSize: 14, color: C.dim, margin: '0 0 14px' }}>
              {TEXTS.hero_sub}
            </p>

            {/* Badge atualização */}
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 11, color: 'rgba(34,211,238,0.4)',
              background: 'rgba(0,188,212,0.06)',
              border: '1px solid rgba(0,188,212,0.12)',
              borderRadius: 999, padding: '4px 12px',
              letterSpacing: '0.06em',
            }}>
              {TEXTS.hero_badge}
            </span>
          </div>
        </Section>

        {/* ── Clinic Stats ──────────────────────────────────────── */}
        <Section id="stats">
          <div style={S.sectionLabel}>{TEXTS.stats_tag}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 14 }}>
            <StatCard label={TEXTS.stats_sessions}   value={stats.totalSessions}            accent />
            <StatCard label={TEXTS.stats_certs}      value={stats.totalCertificates}        accent />
            <StatCard label={TEXTS.stats_drama}      value={`${stats.avgDrama}/10`} />
            <StatCard label={TEXTS.stats_pao}        value={`${stats.avgPaoDeQueijo}%`} />
            <StatCard label={TEXTS.stats_archetypes} value={stats.totalUniqueArchetypes} />
            <StatCard label={TEXTS.stats_achieve}    value={stats.totalAchievementsUnlocked} />
          </div>
        </Section>

        <Divider />

        {/* ── Top Archetypes ────────────────────────────────────── */}
        <Section id="top-archetypes">
          <div style={S.sectionLabel}>{TEXTS.top_tag}</div>
          <h2 style={S.sectionTitle}>{TEXTS.top_title}</h2>

          {topArchetypes.length === 0 ? (
            <p style={S.muted}>{TEXTS.top_empty}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {topArchetypes.map((a, i) => {
                const barPct = Math.round((a.count / maxTopCount) * 100)
                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`
                const isTop3 = i < 3
                return (
                  <div
                    key={a.name}
                    style={{
                      ...S.card,
                      border: i === 0 ? `1px solid ${C.borderCyan}` : `1px solid ${C.border}`,
                      boxShadow: i === 0 ? '0 0 20px rgba(0,188,212,0.08)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#f0f0ff' }}>
                        <span style={{ marginRight: 8 }}>{medal}</span>{a.name}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: isTop3 ? C.cyan : C.gold }}>
                        {a.count}
                      </span>
                    </div>
                    <div style={{ height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 3,
                        width: `${barPct}%`,
                        background: i === 0
                          ? `linear-gradient(90deg, ${C.cyan}90, ${C.cyan})`
                          : i < 3
                          ? 'linear-gradient(90deg, rgba(0,188,212,0.5), rgba(124,58,237,0.6))'
                          : 'linear-gradient(90deg, rgba(74,144,217,0.4), rgba(155,89,182,0.4))',
                        boxShadow: i === 0 ? `0 0 8px rgba(34,211,238,0.5)` : 'none',
                      }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Section>

        <Divider />

        {/* ── Rare Archetypes ───────────────────────────────────── */}
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
                    border: `1px solid ${C.borderGold}`,
                    display: 'flex', flexDirection: 'column', gap: 4,
                    boxShadow: '0 0 16px rgba(201,168,76,0.06)',
                  }}
                >
                  <span style={{ fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.labelGold }}>
                    {TEXTS.rare_badge}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#f0f0ff' }}>{a.name}</span>
                  <span style={{ fontSize: 11, color: C.muted }}>
                    {a.createdAt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Divider />

        {/* ── Pão de Queijo ─────────────────────────────────────── */}
        <Section id="pao">
          <div style={S.sectionLabel}>{TEXTS.pao_tag}</div>
          <h2 style={S.sectionTitle}>{TEXTS.pao_title}</h2>
          <p style={S.sectionSub}>{TEXTS.pao_sub}</p>

          {paoDeQueijo.length === 0 ? (
            <p style={S.muted}>{TEXTS.pao_empty}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {paoDeQueijo.map((e, i) => (
                <div
                  key={e.arquetipoCanino}
                  style={{
                    ...S.card,
                    display: 'flex', alignItems: 'center', gap: 14,
                    border: i === 0 ? `1px solid ${C.borderGold}` : `1px solid ${C.border}`,
                  }}
                >
                  <span style={{ fontSize: 20, minWidth: 28 }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🥐'}
                  </span>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: '#f0f0ff' }}>
                    {e.arquetipoCanino}
                  </span>
                  <span style={{ fontSize: 18, fontWeight: 900, color: C.gold }}>{e.avgPao}%</span>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Divider />

        {/* ── Rarity Distribution ───────────────────────────────── */}
        <Section id="raridades">
          <div style={S.sectionLabel}>{TEXTS.rarity_tag}</div>
          <h2 style={S.sectionTitle}>{TEXTS.rarity_title}</h2>

          {rarityDist.length === 0 ? (
            <p style={S.muted}>{TEXTS.rarity_empty}</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 12 }}>
              {rarityDist.map((r) => {
                const meta = RARITY_META[r.rarity] ?? { emoji: '🔮', color: '#8e99a4', stars: '', label: r.rarity }
                return (
                  <div
                    key={r.rarity}
                    style={{
                      ...S.card,
                      flex: '1 1 130px', textAlign: 'center',
                      border: `1px solid ${meta.color}30`,
                      boxShadow: `0 0 24px ${meta.color}12`,
                      padding: '18px 14px',
                    }}
                  >
                    <div style={{ fontSize: 30, marginBottom: 6 }}>{meta.emoji}</div>
                    <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: meta.color, marginBottom: 6 }}>
                      {meta.label}
                    </div>
                    <div style={{ fontSize: 26, fontWeight: 900, color: meta.color, lineHeight: 1 }}>{r.count}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{r.percent}%</div>
                    <div style={{ fontSize: 10, marginTop: 6, letterSpacing: '0.05em' }}>{meta.stars}</div>
                  </div>
                )
              })}
            </div>
          )}
        </Section>

        <Divider />

        {/* ── Drama Ranking ─────────────────────────────────────── */}
        <Section id="drama">
          <div style={S.sectionLabel}>{TEXTS.drama_tag}</div>
          <h2 style={S.sectionTitle}>{TEXTS.drama_title}</h2>
          <p style={S.sectionSub}>{TEXTS.drama_sub}</p>

          {dramaRanking.length === 0 ? (
            <p style={S.muted}>{TEXTS.drama_empty}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {dramaRanking.map((d, i) => {
                const dramaColor =
                  d.nivelDrama >= 9 ? C.gold
                  : d.nivelDrama >= 7 ? '#c39bd3'
                  : d.nivelDrama >= 5 ? C.cyan
                  : C.muted

                return (
                  <div key={`${d.arquetipoCanino}-${i}`} style={S.card}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: d.fraseCompartilhavel ? 10 : 0 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#f0f0ff' }}>
                        {i === 0 ? '🎭 ' : `${i + 1}. `}{d.arquetipoCanino}
                      </span>
                      <span style={{
                        fontSize: 15, fontWeight: 900, color: dramaColor,
                        background: `${dramaColor}12`,
                        border: `1px solid ${dramaColor}25`,
                        borderRadius: 8, padding: '2px 10px',
                        flexShrink: 0, marginLeft: 10,
                      }}>
                        {d.nivelDrama}/10
                      </span>
                    </div>
                    {d.fraseCompartilhavel && (
                      <p style={{
                        fontSize: 12, color: C.dim, margin: 0,
                        fontStyle: 'italic', lineHeight: 1.6,
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

        <Divider />

        {/* ── Agatha Insights ───────────────────────────────────── */}
        <Section id="insights">
          <div style={S.sectionLabel}>{TEXTS.insights_tag}</div>
          <h2 style={S.sectionTitle}>{TEXTS.insights_title}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {insights.map((ins, i) => (
              <div
                key={i}
                style={{
                  ...S.cardCyan,
                  display: 'flex', alignItems: 'flex-start', gap: 14,
                }}
              >
                <span style={{ fontSize: 22, flexShrink: 0 }}>{ins.emoji}</span>
                <p style={{ margin: 0, fontSize: 14, color: 'rgba(240,240,255,0.75)', lineHeight: 1.7 }}>
                  {ins.text}
                </p>
              </div>
            ))}
          </div>
        </Section>

        <Divider />

        {/* ── Hall of Champions ─────────────────────────────────── */}
        <Section id="conquistas">
          <div style={S.sectionLabel}>{TEXTS.achieve_tag}</div>
          <h2 style={S.sectionTitle}>{TEXTS.achieve_title}</h2>

          {topAchievements.length === 0 ? (
            <p style={S.muted}>{TEXTS.achieve_empty}</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
              {topAchievements.map((a, i) => (
                <div
                  key={a.id}
                  style={{
                    ...S.card,
                    flex: '1 1 160px',
                    border: i === 0 ? `1px solid ${C.borderGold}` : `1px solid ${C.border}`,
                    boxShadow: i === 0 ? '0 0 24px rgba(201,168,76,0.10)' : 'none',
                    textAlign: 'center', padding: '18px 14px',
                  }}
                >
                  <div style={{ fontSize: 30, marginBottom: 8 }}>{a.emoji}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#f0f0ff', marginBottom: 4, lineHeight: 1.3 }}>
                    {a.title}
                  </div>
                  <div style={{ fontSize: 11, color: C.labelGold }}>
                    {a.count} {a.count === 1 ? TEXTS.achieve_vezes : TEXTS.achieve_vezesP}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* ── CTA ───────────────────────────────────────────────── */}
        <section id="cta">
          <div style={{
            textAlign: 'center',
            padding: '44px 28px',
            background: `linear-gradient(145deg, rgba(0,188,212,0.06) 0%, rgba(124,58,237,0.10) 100%)`,
            border: `1px solid ${C.borderCyan}`,
            borderRadius: 20,
            backdropFilter: 'blur(20px)',
            boxShadow: '0 0 60px rgba(0,188,212,0.06)',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Glow decorativo */}
            <div style={{
              position: 'absolute', top: -60, right: -60,
              width: 200, height: 200, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0,188,212,0.10) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />

            <div style={S.sectionLabel}>{TEXTS.cta_tag}</div>
            <h2 style={{ ...S.sectionTitle, fontSize: 26, marginTop: 10 }}>{TEXTS.cta_title}</h2>
            <p style={{ fontSize: 14, color: C.dim, margin: '0 0 32px', lineHeight: 1.7 }}>
              {TEXTS.cta_sub}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 320, margin: '0 auto' }}>
              <Link
                href="/chat"
                style={{
                  display: 'block', padding: '14px',
                  borderRadius: 14, fontSize: 15, fontWeight: 700, color: '#080e1a',
                  background: `linear-gradient(135deg, ${C.cyan}, rgba(74,144,217,0.9))`,
                  boxShadow: '0 4px 24px rgba(0,188,212,0.28)',
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
                  border: `1.5px solid ${C.borderCyan}`,
                  fontSize: 14, fontWeight: 600,
                  color: C.cyan,
                  background: 'rgba(0,188,212,0.06)',
                  textDecoration: 'none',
                }}
              >
                {TEXTS.cta_btn2}
              </Link>
            </div>
          </div>
        </section>

      </div>
    </main>
  )
}
