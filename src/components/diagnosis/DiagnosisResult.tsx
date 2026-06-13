'use client'

import { forwardRef } from 'react'
import type { DiagnosisPayload } from '@/hooks/useChatSession'

interface DiagnosisResultProps {
  diagnosis: DiagnosisPayload
  shareToken?: string
  captureMode?: boolean
}

function dramaConfig(level: number) {
  if (level <= 2) return { color: '#27ae60', bg: 'rgba(39,174,96,0.12)',   border: 'rgba(39,174,96,0.3)',   label: 'Zen Total ☮️'     }
  if (level <= 4) return { color: '#2ecc71', bg: 'rgba(46,204,113,0.10)',  border: 'rgba(46,204,113,0.25)', label: 'Tranquilo 🌿'    }
  if (level <= 6) return { color: '#f39c12', bg: 'rgba(243,156,18,0.10)',  border: 'rgba(243,156,18,0.25)', label: 'Moderado 🌊'     }
  if (level <= 8) return { color: '#e67e22', bg: 'rgba(230,126,34,0.10)',  border: 'rgba(230,126,34,0.25)', label: 'Intenso 🔥'      }
  return           { color: '#e74c3c', bg: 'rgba(231,76,60,0.12)',    border: 'rgba(231,76,60,0.3)',   label: 'Novela das 9 🎭' }
}

export const DiagnosisResult = forwardRef<HTMLDivElement, DiagnosisResultProps>(
  ({ diagnosis, captureMode = false }, ref) => {
    const drama = dramaConfig(diagnosis.nivelDrama)

    const cardBg = captureMode
      ? '#131325'
      : 'linear-gradient(145deg, rgba(19,19,37,0.96) 0%, rgba(26,18,46,0.96) 100%)'

    const backdropStyle = captureMode
      ? {}
      : { backdropFilter: 'blur(32px) saturate(1.8)', WebkitBackdropFilter: 'blur(32px) saturate(1.8)' }

    return (
      <div
        ref={ref}
        style={{
          background: cardBg,
          ...backdropStyle,
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 24,
          overflow: 'hidden',
          width: '100%',
          maxWidth: 520,
          fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)',
          color: '#f0f0ff',
          boxShadow: captureMode
            ? 'none'
            : '0 0 80px rgba(74,144,217,0.18), 0 0 120px rgba(155,89,182,0.10), 0 8px 40px rgba(0,0,0,0.4)',
        }}
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(74,144,217,0.22) 0%, rgba(155,89,182,0.22) 100%)',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            padding: '24px 24px 20px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Orbe decorativo topo-direita */}
          <div style={{
            position: 'absolute', top: -50, right: -40,
            width: 160, height: 160, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(155,89,182,0.28) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          {/* Orbe decorativo baixo-esquerda */}
          <div style={{
            position: 'absolute', bottom: -30, left: -20,
            width: 100, height: 100, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(74,144,217,0.2) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative' }}>
            {/* Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(74,144,217,0.15)',
              border: '1px solid rgba(74,144,217,0.3)',
              borderRadius: 999,
              padding: '3px 10px',
              marginBottom: 14,
            }}>
              <span style={{ fontSize: 10 }}>🐾</span>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4a90d9' }}>
                Diagnóstico Psicanino Oficial™
              </span>
            </div>

            <h2 style={{
              fontSize: 20, fontWeight: 800, lineHeight: 1.3,
              color: '#f0f0ff', margin: '0 0 8px',
            }}>
              {diagnosis.diagnostico}
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontSize: 11, fontWeight: 600,
                color: 'rgba(195,155,211,0.9)',
                background: 'rgba(155,89,182,0.15)',
                border: '1px solid rgba(155,89,182,0.25)',
                borderRadius: 999,
                padding: '3px 10px',
              }}>
                🐩 {diagnosis.arquetipoCanino}
              </span>
            </div>
          </div>
        </div>

        {/* ── Body ───────────────────────────────────────────────────── */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Nível de Drama */}
          <div style={{
            background: drama.bg,
            border: `1px solid ${drama.border}`,
            borderRadius: 14, padding: '14px 16px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: drama.color }}>
                🎭 Nível de Drama
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: drama.color }}>
                {diagnosis.nivelDrama}/10 · {drama.label}
              </span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 4,
                width: `${diagnosis.nivelDrama * 10}%`,
                background: `linear-gradient(90deg, ${drama.color}88, ${drama.color})`,
                transition: 'width 0.6s ease',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
              {[1, 5, 10].map((n) => (
                <span key={n} style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)' }}>{n}</span>
              ))}
            </div>
          </div>

          {/* Sintomas */}
          {diagnosis.sintomas.length > 0 && (
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(240,240,255,0.4)', marginBottom: 10 }}>
                🩺 Sintomas Identificados
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {diagnosis.sintomas.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ color: '#4a90d9', fontSize: 10, marginTop: 4, flexShrink: 0 }}>◆</span>
                    <span style={{ fontSize: 13, color: '#f0f0ff', lineHeight: 1.5 }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

          {/* Prescrição */}
          <div style={{
            background: 'rgba(74,144,217,0.08)',
            border: '1px solid rgba(74,144,217,0.2)',
            borderRadius: 14, padding: '14px 16px',
          }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4a90d9', marginBottom: 8 }}>
              💊 Prescrição
            </p>
            <p style={{ fontSize: 13, fontStyle: 'italic', color: '#f0f0ff', lineHeight: 1.6, margin: 0 }}>
              {diagnosis.prescricao}
            </p>
          </div>

          {/* Palavra final */}
          <div style={{
            background: 'rgba(155,89,182,0.08)',
            border: '1px solid rgba(155,89,182,0.18)',
            borderRadius: 14, padding: '14px 16px',
          }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#c39bd3', marginBottom: 8 }}>
              🤍 Palavra Final da Agatha
            </p>
            <p style={{ fontSize: 13, color: '#f0f0ff', lineHeight: 1.6, margin: 0 }}>
              {diagnosis.resumoAfetivo}
            </p>
          </div>

          {/* Frase compartilhável — destaque */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(74,144,217,0.1) 0%, rgba(155,89,182,0.1) 100%)',
            border: '1.5px solid rgba(155,89,182,0.3)',
            borderRadius: 14,
            padding: '16px 18px',
            position: 'relative',
          }}>
            <span style={{
              position: 'absolute', top: -1, left: 16,
              background: 'rgba(155,89,182,0.85)',
              borderRadius: 999,
              padding: '2px 10px',
              fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: '#fff',
            }}>
              💬 Para mandar no grupo
            </span>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#f0f0ff', lineHeight: 1.55, margin: '8px 0 0', fontStyle: 'italic' }}>
              "{diagnosis.fraseCompartilhavel}"
            </p>
          </div>
        </div>

        {/* ── Rodapé ─────────────────────────────────────────────────── */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.05)',
          padding: '10px 24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 10, color: 'rgba(240,240,255,0.25)' }}>
            🐾 agatha.psicanina
          </span>
          <span style={{ fontSize: 10, color: 'rgba(240,240,255,0.2)' }}>
            entretenimento, não psicologia real
          </span>
        </div>
      </div>
    )
  },
)

DiagnosisResult.displayName = 'DiagnosisResult'
