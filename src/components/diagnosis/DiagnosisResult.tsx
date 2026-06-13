'use client'

import { forwardRef } from 'react'
import type { DiagnosisPayload } from '@/hooks/useChatSession'

interface DiagnosisResultProps {
  diagnosis: DiagnosisPayload
  shareToken?: string
  /** Quando true, renderiza em modo de captura (sem blur/backdrop, fundo sólido) */
  captureMode?: boolean
}

// Cores por nível de drama
function dramaConfig(level: number) {
  if (level <= 2) return { color: '#27ae60', bg: 'rgba(39,174,96,0.12)', border: 'rgba(39,174,96,0.3)', label: 'Zen Total ☮️' }
  if (level <= 4) return { color: '#2ecc71', bg: 'rgba(46,204,113,0.10)', border: 'rgba(46,204,113,0.25)', label: 'Tranquilo 🌿' }
  if (level <= 6) return { color: '#f39c12', bg: 'rgba(243,156,18,0.10)', border: 'rgba(243,156,18,0.25)', label: 'Moderado 🌊' }
  if (level <= 8) return { color: '#e67e22', bg: 'rgba(230,126,34,0.10)', border: 'rgba(230,126,34,0.25)', label: 'Intenso 🔥' }
  return { color: '#e74c3c', bg: 'rgba(231,76,60,0.12)', border: 'rgba(231,76,60,0.3)', label: 'Novela das 9 🎭' }
}

export const DiagnosisResult = forwardRef<HTMLDivElement, DiagnosisResultProps>(
  ({ diagnosis, captureMode = false }, ref) => {
    const drama = dramaConfig(diagnosis.nivelDrama)

    const cardBg = captureMode
      ? '#131325'
      : 'linear-gradient(145deg, rgba(19,19,37,0.95) 0%, rgba(26,18,46,0.95) 100%)'

    const backdropStyle = captureMode
      ? {}
      : { backdropFilter: 'blur(32px) saturate(1.8)', WebkitBackdropFilter: 'blur(32px) saturate(1.8)' }

    return (
      <div
        ref={ref}
        style={{
          background: cardBg,
          ...backdropStyle,
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 24,
          overflow: 'hidden',
          width: '100%',
          maxWidth: 520,
          fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)',
          color: '#f0f0ff',
          boxShadow: captureMode
            ? 'none'
            : '0 0 60px rgba(74,144,217,0.2), 0 0 100px rgba(155,89,182,0.12)',
        }}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(74,144,217,0.2) 0%, rgba(155,89,182,0.2) 100%)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            padding: '28px 28px 22px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Orbe decorativo */}
          <div style={{
            position: 'absolute', top: -40, right: -30,
            width: 140, height: 140,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(155,89,182,0.3) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, position: 'relative' }}>
            {/* Avatar */}
            <div style={{
              width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, rgba(74,144,217,0.4), rgba(155,89,182,0.4))',
              border: '1.5px solid rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28,
            }}>🐾</div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: 'rgba(74,144,217,1)',
                marginBottom: 6,
              }}>
                Diagnóstico Psicanino Oficial™
              </p>
              <h1 style={{
                fontSize: 20, fontWeight: 800, lineHeight: 1.25,
                color: '#f0f0ff', margin: 0,
              }}>
                {diagnosis.diagnostico}
              </h1>
              <p style={{ fontSize: 13, color: 'rgba(195,155,211,1)', marginTop: 6 }}>
                🐩 {diagnosis.arquetipoCanino}
              </p>
            </div>
          </div>
        </div>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        <div style={{ padding: '22px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Nível de Drama */}
          <div style={{
            background: drama.bg,
            border: `1px solid ${drama.border}`,
            borderRadius: 14,
            padding: '14px 16px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: drama.color }}>
                🎭 Nível de Drama
              </span>
              <span style={{ fontSize: 12, fontWeight: 600, color: drama.color }}>
                {diagnosis.nivelDrama}/10 · {drama.label}
              </span>
            </div>
            {/* Barra de progresso */}
            <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 4,
                width: `${diagnosis.nivelDrama * 10}%`,
                background: `linear-gradient(90deg, ${drama.color}88, ${drama.color})`,
              }} />
            </div>
            {/* Marcadores 1–10 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
              {[1, 5, 10].map((n) => (
                <span key={n} style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>{n}</span>
              ))}
            </div>
          </div>

          {/* Sintomas */}
          {diagnosis.sintomas.length > 0 && (
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(240,240,255,0.45)', marginBottom: 10 }}>
                🩺 Sintomas Identificados
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {diagnosis.sintomas.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ color: '#4a90d9', fontSize: 10, marginTop: 3, flexShrink: 0 }}>◆</span>
                    <span style={{ fontSize: 13, color: '#f0f0ff', lineHeight: 1.5 }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Divisória */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

          {/* Prescrição */}
          <div style={{
            background: 'rgba(74,144,217,0.08)',
            border: '1px solid rgba(74,144,217,0.22)',
            borderRadius: 14,
            padding: '14px 16px',
          }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4a90d9', marginBottom: 8 }}>
              💊 Prescrição
            </p>
            <p style={{ fontSize: 13, fontStyle: 'italic', color: '#f0f0ff', lineHeight: 1.6, margin: 0 }}>
              {diagnosis.prescricao}
            </p>
          </div>

          {/* Resumo Afetivo */}
          <div style={{
            background: 'rgba(155,89,182,0.08)',
            border: '1px solid rgba(155,89,182,0.18)',
            borderRadius: 14,
            padding: '14px 16px',
          }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#c39bd3', marginBottom: 8 }}>
              🤍 Palavra Final da Agatha
            </p>
            <p style={{ fontSize: 13, color: '#f0f0ff', lineHeight: 1.6, margin: 0 }}>
              {diagnosis.resumoAfetivo}
            </p>
          </div>

          {/* Frase compartilhável */}
          <div style={{
            border: '1.5px dashed rgba(255,255,255,0.15)',
            borderRadius: 14,
            padding: '14px 16px',
          }}>
            <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(240,240,255,0.4)', marginBottom: 6 }}>
              💬 Para copiar e mandar no grupo
            </p>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#f0f0ff', lineHeight: 1.5, margin: 0 }}>
              "{diagnosis.fraseCompartilhavel}"
            </p>
          </div>
        </div>

        {/* ── Rodapé ─────────────────────────────────────────────────────── */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '12px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: 10, color: 'rgba(240,240,255,0.3)' }}>
            🐾 agatha.psicanina · entretenimento
          </span>
          <span style={{ fontSize: 10, color: 'rgba(240,240,255,0.2)' }}>
            Não é psicologia real
          </span>
        </div>
      </div>
    )
  },
)

DiagnosisResult.displayName = 'DiagnosisResult'
