'use client'

import { useState } from 'react'
import type { RarityResult } from '@/lib/ranking-analytics'

// ─── i18n ─────────────────────────────────────────────────────────────────────

const TEXTS = {
  section_tag:    '✦ Meu Lugar no Universo',
  certified_by:   'Certificado pela Dra. Agatha PsiCanina',
  rarer_label:    'Mais exclusivo que',
  rarer_suffix:   '% dos pacientes',
  first_ever:     'Primeiro do seu arquétipo a ser certificado.',
  count_of:       (n: number, total: number) =>
    `${n} de ${total} ${total === 1 ? 'diagnóstico certificado' : 'diagnósticos certificados'} com esse arquétipo.`,
  btn_copy:       'Copiar Status',
  btn_copied:     'Copiado! 🐾',
  // Template de compartilhamento — tom Agatha: divertido, levemente irônico
  shareTemplate:  (archetype: string, title: string, score: number, url: string) =>
    `🐾 Diagnóstico PsiCanina da Dra. Agatha:\n` +
    `🎭 Meu arquétipo: ${archetype}\n` +
    `💎 Raridade: ${title} (Mais exclusivo que ${score}% dos pacientes).\n\n` +
    `"A Dra. Agatha diz que o meu caso é fascinante..."\n\n` +
    `Venha descobrir o seu diagnóstico também: ${url}`,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Bordas decorativas do selo
function CornerDot({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const style: React.CSSProperties = {
    position: 'absolute', width: 6, height: 6, borderRadius: '50%',
    ...(pos === 'tl' ? { top: 14, left: 14 }
       : pos === 'tr' ? { top: 14, right: 14 }
       : pos === 'bl' ? { bottom: 14, left: 14 }
       : { bottom: 14, right: 14 }),
  }
  return <div style={style} />
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  rarityData: RarityResult
  arquetipoCanino: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RarityBadge({ rarityData, arquetipoCanino }: Props) {
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')

  const { rarityScore, archetypeCount, totalCertificates, emoji, color, title, description } =
    rarityData

  const isFirst = archetypeCount <= 1
  const barWidth = Math.max(rarityScore, 4)

  function handleCopy() {
    const url =
      typeof window !== 'undefined'
        ? `${window.location.origin}/chat`
        : 'https://agatha-psicanina.vercel.app/chat'

    const text = TEXTS.shareTemplate(arquetipoCanino, title, rarityScore, url)

    navigator.clipboard.writeText(text).then(() => {
      setCopyState('copied')
      setTimeout(() => setCopyState('idle'), 2800)
    })
  }

  return (
    <>
      <style>{`
        @keyframes rarity-pulse { 0%,100%{opacity:0.4} 50%{opacity:0.75} }
        .rarity-glow { animation: rarity-pulse 3s ease-in-out infinite }
      `}</style>

      <div
        style={{
          width: '100%',
          maxWidth: 520,
          margin: '0 0 4px',
          position: 'relative',
          // Selo: fundo escuro com borda colorida dupla
          background: `linear-gradient(160deg, rgba(19,13,38,0.97) 0%, rgba(26,14,50,0.97) 100%)`,
          border: `1.5px solid ${color}50`,
          borderRadius: 20,
          padding: '24px 24px 20px',
          boxShadow: `0 0 0 1px ${color}18, 0 0 40px ${color}20, 0 6px 32px rgba(0,0,0,0.35)`,
          overflow: 'hidden',
        }}
      >
        {/* Glow radial de fundo */}
        <div
          className="rarity-glow"
          style={{
            position: 'absolute', top: -60, right: -60,
            width: 220, height: 220, borderRadius: '50%',
            background: `radial-gradient(circle, ${color}28 0%, transparent 65%)`,
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute', bottom: -40, left: -40,
            width: 160, height: 160, borderRadius: '50%',
            background: `radial-gradient(circle, ${color}12 0%, transparent 65%)`,
            pointerEvents: 'none',
          }}
        />

        {/* Pontos decorativos de canto */}
        {(['tl', 'tr', 'bl', 'br'] as const).map((p) => (
          <CornerDot key={p} pos={p} />
        ))}

        {/* Section tag */}
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'rgba(201,168,76,0.55)',
          marginBottom: 16,
        }}>
          {TEXTS.section_tag}
        </div>

        {/* ── Corpo do Selo ─────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', marginBottom: 18 }}>

          {/* Medallion */}
          <div style={{
            flexShrink: 0,
            width: 68, height: 68, borderRadius: '50%',
            border: `2px solid ${color}60`,
            boxShadow: `0 0 16px ${color}40, inset 0 0 12px ${color}15`,
            background: `radial-gradient(circle at 40% 35%, ${color}22 0%, rgba(19,13,38,0.9) 70%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 30,
            position: 'relative',
          }}>
            {emoji}
            {/* Anel externo */}
            <div style={{
              position: 'absolute', inset: -5, borderRadius: '50%',
              border: `1px dashed ${color}30`,
            }} />
          </div>

          {/* Título + descrição */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: `${color}80`,
              marginBottom: 4,
            }}>
              {TEXTS.certified_by}
            </div>

            <div style={{
              fontSize: 20, fontWeight: 900, lineHeight: 1.2,
              color,
              marginBottom: 6,
              textShadow: `0 0 20px ${color}50`,
            }}>
              {title}
            </div>

            <p style={{
              margin: 0, fontSize: 12,
              color: 'rgba(240,240,255,0.5)',
              lineHeight: 1.6,
            }}>
              {description}
            </p>
          </div>
        </div>

        {/* ── Score bar ─────────────────────────────────────── */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 12,
          padding: '12px 14px',
          marginBottom: 16,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'baseline' }}>
            <span style={{ fontSize: 12, color: 'rgba(240,240,255,0.4)' }}>
              {TEXTS.rarer_label}
            </span>
            <span style={{ fontSize: 22, fontWeight: 900, color, lineHeight: 1 }}>
              {rarityScore}<span style={{ fontSize: 13, opacity: 0.7 }}>%</span>
            </span>
          </div>

          <div style={{
            height: 6, background: 'rgba(255,255,255,0.06)',
            borderRadius: 3, overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', borderRadius: 3,
              width: `${barWidth}%`,
              background: `linear-gradient(90deg, ${color}70, ${color})`,
              boxShadow: `0 0 8px ${color}70`,
            }} />
          </div>

          <div style={{ fontSize: 11, color: 'rgba(240,240,255,0.3)', marginTop: 6 }}>
            {TEXTS.rarer_suffix} •{' '}
            {isFirst
              ? TEXTS.first_ever
              : TEXTS.count_of(archetypeCount, totalCertificates)
            }
          </div>
        </div>

        {/* ── Botão Copiar Status ───────────────────────────── */}
        <button
          onClick={handleCopy}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', padding: '13px 16px',
            borderRadius: 13,
            border: copyState === 'copied'
              ? '1.5px solid rgba(39,174,96,0.55)'
              : `1.5px solid ${color}50`,
            cursor: 'pointer',
            fontSize: 14, fontWeight: 700,
            color: copyState === 'copied' ? '#27ae60' : color,
            background: copyState === 'copied'
              ? 'rgba(39,174,96,0.09)'
              : `linear-gradient(135deg, ${color}14, ${color}08)`,
            boxShadow: copyState === 'copied' ? 'none' : `0 0 16px ${color}18`,
            transition: 'all 0.2s ease',
            letterSpacing: '0.02em',
          }}
        >
          <span style={{ fontSize: 16 }}>
            {copyState === 'copied' ? '✅' : '📋'}
          </span>
          {copyState === 'copied' ? TEXTS.btn_copied : TEXTS.btn_copy}
        </button>
      </div>
    </>
  )
}
