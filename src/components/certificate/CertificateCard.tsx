'use client'

import { forwardRef } from 'react'
import type { DiagnosisPayload } from '@/hooks/useChatSession'

export interface CertificateData {
  diagnosis: DiagnosisPayload
  patientName: string
  certificateNumber: string
  createdAt: string
}

function Stars({ level }: { level: number }) {
  return (
    <span style={{ fontSize: 20, letterSpacing: 2 }}>
      {Array.from({ length: 10 }, (_, i) => (
        <span key={i} style={{ opacity: i < level ? 1 : 0.2 }}>⭐</span>
      )).slice(0, 10)}
    </span>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

interface Props extends CertificateData {
  captureMode?: boolean
}

export const CertificateCard = forwardRef<HTMLDivElement, Props>(
  ({ diagnosis, patientName, certificateNumber, createdAt, captureMode = false }, ref) => {
    const bg = captureMode ? '#0d0b1e' : 'linear-gradient(160deg, #0d0b1e 0%, #140e2b 60%, #0d0b1e 100%)'
    const blur = captureMode ? {} : { backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }

    return (
      <div
        ref={ref}
        style={{
          background: bg,
          ...blur,
          border: '1.5px solid rgba(201,168,76,0.35)',
          borderRadius: 20,
          overflow: 'hidden',
          width: '100%',
          maxWidth: 540,
          fontFamily: 'Georgia, "Times New Roman", serif',
          color: '#f5f0e0',
          position: 'relative',
          boxShadow: captureMode
            ? 'none'
            : '0 0 80px rgba(201,168,76,0.12), 0 8px 40px rgba(0,0,0,0.6)',
        }}
      >
        {/* Cantos dourados decorativos */}
        {['top-left','top-right','bottom-left','bottom-right'].map((pos) => {
          const isTop = pos.includes('top')
          const isLeft = pos.includes('left')
          return (
            <div key={pos} style={{
              position: 'absolute',
              [isTop ? 'top' : 'bottom']: 10,
              [isLeft ? 'left' : 'right']: 10,
              width: 32, height: 32,
              borderTop: isTop ? '2px solid rgba(201,168,76,0.5)' : 'none',
              borderBottom: !isTop ? '2px solid rgba(201,168,76,0.5)' : 'none',
              borderLeft: isLeft ? '2px solid rgba(201,168,76,0.5)' : 'none',
              borderRight: !isLeft ? '2px solid rgba(201,168,76,0.5)' : 'none',
              pointerEvents: 'none',
            }} />
          )
        })}

        {/* ── Topo ── */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(201,168,76,0.15) 0%, rgba(201,168,76,0.05) 100%)',
          borderBottom: '1px solid rgba(201,168,76,0.2)',
          padding: '28px 32px 22px',
          textAlign: 'center',
          position: 'relative',
        }}>
          {/* Patinhas decorativas de fundo */}
          <div style={{
            position: 'absolute', top: 8, left: 16,
            fontSize: 20, opacity: 0.08, userSelect: 'none',
          }}>🐾🐾🐾</div>
          <div style={{
            position: 'absolute', top: 8, right: 16,
            fontSize: 20, opacity: 0.08, userSelect: 'none',
          }}>🐾🐾🐾</div>

          {/* Selo */}
          <div style={{
            display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
            background: 'radial-gradient(circle, rgba(201,168,76,0.2) 0%, transparent 70%)',
            borderRadius: '50%',
            width: 80, height: 80,
            border: '2px solid rgba(201,168,76,0.4)',
            justifyContent: 'center',
            marginBottom: 16,
            fontSize: 36,
          }}>
            🏅
          </div>

          <div style={{
            fontSize: 10, fontFamily: 'system-ui, sans-serif',
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'rgba(201,168,76,0.7)', marginBottom: 6,
          }}>
            ✦ Certificado Oficial ✦
          </div>

          <h2 style={{
            fontSize: 22, fontWeight: 700, letterSpacing: '0.04em',
            color: '#e8c776', margin: '0 0 4px',
            textShadow: '0 0 20px rgba(201,168,76,0.4)',
          }}>
            PsiCanino
          </h2>

          <p style={{
            fontSize: 11, fontFamily: 'system-ui, sans-serif',
            color: 'rgba(245,240,224,0.5)', letterSpacing: '0.08em',
            textTransform: 'uppercase', margin: 0,
          }}>
            CRP — Conselho Regional dos Pets
          </p>
        </div>

        {/* ── Corpo ── */}
        <div style={{ padding: '24px 32px', textAlign: 'center' }}>

          <p style={{
            fontSize: 13, fontFamily: 'system-ui, sans-serif',
            color: 'rgba(245,240,224,0.6)', marginBottom: 6, letterSpacing: '0.04em',
          }}>
            A Dra. Agatha PsiCanina certifica que
          </p>

          {/* Nome do paciente */}
          <div style={{
            borderBottom: '1.5px solid rgba(201,168,76,0.4)',
            paddingBottom: 6,
            marginBottom: 16,
          }}>
            <p style={{
              fontSize: 26, fontWeight: 700, color: '#e8c776',
              margin: 0, letterSpacing: '0.02em',
              textShadow: '0 0 16px rgba(201,168,76,0.3)',
            }}>
              {patientName}
            </p>
          </div>

          <p style={{
            fontSize: 13, fontFamily: 'system-ui, sans-serif',
            color: 'rgba(245,240,224,0.6)', marginBottom: 14,
          }}>
            foi oficialmente diagnosticado(a) como:
          </p>

          {/* Arquétipo */}
          <div style={{
            background: 'rgba(201,168,76,0.08)',
            border: '1px solid rgba(201,168,76,0.25)',
            borderRadius: 12,
            padding: '12px 20px',
            marginBottom: 20,
          }}>
            <p style={{
              fontSize: 9, fontFamily: 'system-ui, sans-serif',
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'rgba(201,168,76,0.6)', margin: '0 0 6px',
            }}>🐾 Arquétipo Canino</p>
            <p style={{
              fontSize: 18, fontWeight: 700,
              color: '#f5f0e0', margin: 0, lineHeight: 1.3,
            }}>
              {diagnosis.arquetipoCanino}
            </p>
          </div>

          {/* Nível de Drama */}
          <div style={{ marginBottom: 20 }}>
            <p style={{
              fontSize: 9, fontFamily: 'system-ui, sans-serif',
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'rgba(201,168,76,0.6)', marginBottom: 8,
            }}>🎭 Nível de Drama</p>
            <Stars level={diagnosis.nivelDrama} />
            <p style={{
              fontSize: 12, fontFamily: 'system-ui, sans-serif',
              color: 'rgba(245,240,224,0.5)', marginTop: 4,
            }}>
              {diagnosis.nivelDrama}/10
            </p>
          </div>

          {/* Divisória ornamental */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            marginBottom: 20,
            color: 'rgba(201,168,76,0.35)',
            fontSize: 12,
          }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(201,168,76,0.2)' }} />
            <span>✦ ✦ ✦</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(201,168,76,0.2)' }} />
          </div>

          {/* Prescrição */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 12, padding: '14px 18px',
            marginBottom: 20, textAlign: 'left',
          }}>
            <p style={{
              fontSize: 9, fontFamily: 'system-ui, sans-serif',
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'rgba(201,168,76,0.6)', margin: '0 0 8px',
            }}>💊 Prescrição Oficial</p>
            <p style={{
              fontSize: 13, fontStyle: 'italic',
              color: 'rgba(245,240,224,0.85)', lineHeight: 1.65, margin: 0,
            }}>
              {diagnosis.prescricao}
            </p>
          </div>

          {/* Frase final */}
          <div style={{
            borderLeft: '3px solid rgba(201,168,76,0.4)',
            paddingLeft: 16, textAlign: 'left', marginBottom: 24,
          }}>
            <p style={{
              fontSize: 14, fontStyle: 'italic',
              color: 'rgba(245,240,224,0.75)', lineHeight: 1.6, margin: 0,
            }}>
              "{diagnosis.fraseCompartilhavel}"
            </p>
          </div>

          {/* Assinatura */}
          <div style={{
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            gap: 20, marginBottom: 24,
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: '"Comic Sans MS", "Brush Script MT", cursive',
                fontSize: 22,
                color: '#e8c776',
                opacity: 0.85,
                letterSpacing: '0.05em',
                marginBottom: 4,
              }}>
                Agatha PsiCanina
              </div>
              <div style={{ height: 1, background: 'rgba(201,168,76,0.4)', marginBottom: 4 }} />
              <p style={{
                fontSize: 11, fontFamily: 'system-ui, sans-serif',
                color: 'rgba(245,240,224,0.6)', margin: 0,
              }}>
                Dra. Agatha PsiCanina<br />
                <span style={{ fontSize: 10, color: 'rgba(245,240,224,0.4)' }}>
                  Especialista em Comportamento Humano Estranho
                </span>
              </p>
            </div>
          </div>

          {/* Rodapé do corpo */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: 12, textAlign: 'left',
          }}>
            <div style={{
              background: 'rgba(201,168,76,0.06)',
              border: '1px solid rgba(201,168,76,0.15)',
              borderRadius: 8, padding: '10px 12px',
            }}>
              <p style={{ fontSize: 9, fontFamily: 'system-ui, sans-serif', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.5)', margin: '0 0 3px' }}>
                📅 Data da Consulta
              </p>
              <p style={{ fontSize: 12, color: 'rgba(245,240,224,0.8)', margin: 0 }}>
                {formatDate(createdAt)}
              </p>
            </div>
            <div style={{
              background: 'rgba(201,168,76,0.06)',
              border: '1px solid rgba(201,168,76,0.15)',
              borderRadius: 8, padding: '10px 12px',
            }}>
              <p style={{ fontSize: 9, fontFamily: 'system-ui, sans-serif', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.5)', margin: '0 0 3px' }}>
                📋 Prontuário
              </p>
              <p style={{ fontSize: 12, color: 'rgba(245,240,224,0.8)', margin: 0, fontFamily: 'monospace' }}>
                #{certificateNumber}
              </p>
            </div>
          </div>
        </div>

        {/* ── Rodapé ── */}
        <div style={{
          borderTop: '1px solid rgba(201,168,76,0.15)',
          background: 'rgba(201,168,76,0.04)',
          padding: '10px 24px',
          textAlign: 'center',
        }}>
          <p style={{
            fontSize: 10, fontFamily: 'system-ui, sans-serif',
            color: 'rgba(245,240,224,0.3)', margin: 0, lineHeight: 1.7,
          }}>
            Documento emitido pela Dra. Agatha PsiCanina, especialista em comportamento humano estranho.<br />
            Validade emocional indeterminada. 🐾 Não é psicologia real.
          </p>
        </div>
      </div>
    )
  },
)

CertificateCard.displayName = 'CertificateCard'
