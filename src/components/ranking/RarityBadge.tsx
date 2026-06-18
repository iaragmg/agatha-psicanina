'use client'

import { useState } from 'react'
import type { RarityResult } from '@/lib/ranking-analytics'

// ─── i18n ─────────────────────────────────────────────────────────────────────

const TEXTS = {
  section_tag:      '✦ Meu Lugar no Universo',
  rarer_than:       'Você é mais raro que',
  of_humans:        '% dos humanos certificados',
  first_ever:       'Você é o primeiro do seu arquétipo a ser certificado.',
  count_single:     'diagnóstico com esse arquétipo',
  count_plural:     'diagnósticos com esse arquétipo',
  of_total:         'de',
  total_certified:  'certificados na clínica',
  btn_share:        'Compartilhar meu resultado',
  btn_copied:       'Copiado! Vai mandar no grupo?',
  btn_sharing:      'Link copiado ✓',
  share_text_pre:   '🐾 Meu diagnóstico na Agatha PsiCanina:\n\n',
  share_text_rarity: (score: number, label: string) =>
    `Sou mais raro que ${score}% dos pacientes certificados — ${label}!\n\n`,
  share_text_link:  'Ver diagnóstico completo:',
  share_text_foot:  '\n\n_(entretenimento, não psicologia real)_',
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  rarityData: RarityResult
  shareToken: string
  arquetipoCanino: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RarityBadge({ rarityData, shareToken, arquetipoCanino }: Props) {
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')

  const { rarityScore, archetypeCount, totalCertificates, label, emoji, color } = rarityData

  const isFirst = archetypeCount <= 1

  function handleShare() {
    const url =
      typeof window !== 'undefined'
        ? `${window.location.origin}/diagnostico/${shareToken}`
        : `/diagnostico/${shareToken}`

    const text =
      TEXTS.share_text_pre +
      `🐩 Arquétipo: ${arquetipoCanino}\n` +
      TEXTS.share_text_rarity(rarityScore, label) +
      `${TEXTS.share_text_link} ${url}` +
      TEXTS.share_text_foot

    navigator.clipboard.writeText(text).then(() => {
      setCopyState('copied')
      setTimeout(() => setCopyState('idle'), 2800)
    })
  }

  // Largura da barra de raridade
  const barWidth = Math.max(rarityScore, 4)

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 520,
        margin: '0 0 4px',
        background: 'linear-gradient(145deg, rgba(19,13,38,0.95) 0%, rgba(26,14,50,0.95) 100%)',
        border: `1px solid ${color}35`,
        borderRadius: 20,
        padding: '22px 22px 20px',
        boxShadow: `0 0 32px ${color}18, 0 4px 24px rgba(0,0,0,0.3)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glow de fundo */}
      <div
        style={{
          position: 'absolute', top: -40, right: -40,
          width: 160, height: 160,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Section tag */}
      <div style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'rgba(201,168,76,0.55)',
        marginBottom: 14,
      }}>
        {TEXTS.section_tag}
      </div>

      {/* Score principal */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: `radial-gradient(circle, ${color}25 0%, transparent 70%)`,
          border: `2px solid ${color}50`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, flexShrink: 0,
        }}>
          {emoji}
        </div>

        <div>
          <div style={{ fontSize: 13, color: 'rgba(240,240,255,0.5)', marginBottom: 2 }}>
            {TEXTS.rarer_than}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 38, fontWeight: 900, color, lineHeight: 1 }}>
              {rarityScore}
            </span>
            <span style={{ fontSize: 18, fontWeight: 700, color, opacity: 0.8 }}>
              %
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'rgba(240,240,255,0.4)', marginTop: 1 }}>
            {TEXTS.of_humans}
          </div>
        </div>
      </div>

      {/* Barra de raridade */}
      <div style={{ marginBottom: 14 }}>
        <div style={{
          height: 8, background: 'rgba(255,255,255,0.06)',
          borderRadius: 4, overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', borderRadius: 4,
            width: `${barWidth}%`,
            background: `linear-gradient(90deg, ${color}90, ${color})`,
            boxShadow: `0 0 8px ${color}60`,
            transition: 'width 0.8s ease',
          }} />
        </div>
      </div>

      {/* Label e contexto */}
      <div style={{ marginBottom: 18 }}>
        <span style={{
          display: 'inline-block',
          fontSize: 12, fontWeight: 700,
          color, letterSpacing: '0.04em',
          background: `${color}12`,
          border: `1px solid ${color}30`,
          borderRadius: 8, padding: '4px 10px',
          marginBottom: 8,
        }}>
          {label}
        </span>

        <p style={{ margin: 0, fontSize: 12, color: 'rgba(240,240,255,0.35)', lineHeight: 1.6 }}>
          {isFirst
            ? TEXTS.first_ever
            : `${archetypeCount} ${archetypeCount === 1 ? TEXTS.count_single : TEXTS.count_plural} ${TEXTS.of_total} ${totalCertificates} ${TEXTS.total_certified}.`
          }
        </p>
      </div>

      {/* Botão compartilhar */}
      <button
        onClick={handleShare}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          width: '100%', padding: '12px 16px',
          borderRadius: 12,
          border: `1.5px solid ${copyState === 'copied' ? 'rgba(39,174,96,0.5)' : `${color}40`}`,
          cursor: 'pointer',
          fontSize: 13, fontWeight: 700,
          color: copyState === 'copied' ? '#27ae60' : color,
          background: copyState === 'copied' ? 'rgba(39,174,96,0.08)' : `${color}10`,
          transition: 'all 0.18s ease',
        }}
      >
        <span style={{ fontSize: 15 }}>{copyState === 'copied' ? '✅' : '🔗'}</span>
        {copyState === 'copied' ? TEXTS.btn_copied : TEXTS.btn_share}
      </button>
    </div>
  )
}
