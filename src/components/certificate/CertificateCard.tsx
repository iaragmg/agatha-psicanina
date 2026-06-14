'use client'

import { forwardRef } from 'react'
import type { DiagnosisPayload } from '@/hooks/useChatSession'
import { RARITY_META, type Rarity } from '@/lib/certificate-indicators'

export interface CertificateData {
  diagnosis: DiagnosisPayload
  patientName: string
  certificateNumber: string
  createdAt: string
  rarity: Rarity
  compatibilidadePaoQueijo: number
  chanceEstudarMadrugada: number
  riscoAdotarOutroCachorro: number
}

function Stars({ count, color }: { count: number; color: string }) {
  return (
    <span>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} style={{ color, fontSize: 16, lineHeight: 1 }}>⭐</span>
      ))}
    </span>
  )
}

function DramaStars({ level }: { level: number }) {
  return (
    <span>
      {Array.from({ length: 10 }, (_, i) => (
        <span key={i} style={{ opacity: i < level ? 1 : 0.18, fontSize: 14 }}>⭐</span>
      ))}
    </span>
  )
}

function IndicatorBar({ value, color }: { value: number; color: string }) {
  const filled = Math.round(value / 10)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 5,
          width: `${value}%`,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          transition: 'width 0.6s ease',
        }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color, minWidth: 34, textAlign: 'right', fontFamily: 'monospace' }}>
        {value}%
      </span>
    </div>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

interface Props extends CertificateData {
  captureMode?: boolean
}

export const CertificateCard = forwardRef<HTMLDivElement, Props>(
  ({
    diagnosis, patientName, certificateNumber, createdAt,
    rarity, compatibilidadePaoQueijo, chanceEstudarMadrugada, riscoAdotarOutroCachorro,
    captureMode = false,
  }, ref) => {
    const rm = RARITY_META[rarity] ?? RARITY_META.COMUM
    const bg = captureMode
      ? '#0d0b1e'
      : 'linear-gradient(160deg, #0d0b1e 0%, #140e2b 60%, #0d0b1e 100%)'
    const blur = captureMode ? {} : { backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }

    return (
      <div
        ref={ref}
        style={{
          background: bg, ...blur,
          border: '1.5px solid rgba(201,168,76,0.35)',
          borderRadius: 20, overflow: 'hidden',
          width: '100%', maxWidth: 540,
          fontFamily: 'Georgia, "Times New Roman", serif',
          color: '#f5f0e0', position: 'relative',
          boxShadow: captureMode
            ? 'none'
            : '0 0 80px rgba(201,168,76,0.12), 0 8px 40px rgba(0,0,0,0.6)',
        }}
      >
        {/* Cantos decorativos */}
        {(['top-left','top-right','bottom-left','bottom-right'] as const).map((pos) => {
          const isTop = pos.includes('top'), isLeft = pos.includes('left')
          return (
            <div key={pos} style={{
              position: 'absolute',
              [isTop ? 'top' : 'bottom']: 10, [isLeft ? 'left' : 'right']: 10,
              width: 32, height: 32,
              borderTop:    isTop  ? '2px solid rgba(201,168,76,0.45)' : 'none',
              borderBottom: !isTop ? '2px solid rgba(201,168,76,0.45)' : 'none',
              borderLeft:   isLeft ? '2px solid rgba(201,168,76,0.45)' : 'none',
              borderRight: !isLeft ? '2px solid rgba(201,168,76,0.45)' : 'none',
              pointerEvents: 'none',
            }} />
          )
        })}

        {/* ── Topo ─────────────────────────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(201,168,76,0.15) 0%, rgba(201,168,76,0.05) 100%)',
          borderBottom: '1px solid rgba(201,168,76,0.2)',
          padding: '24px 32px 18px', textAlign: 'center', position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: 8, left: 16, fontSize: 18, opacity: 0.07, userSelect: 'none' }}>🐾🐾🐾</div>
          <div style={{ position: 'absolute', top: 8, right: 16, fontSize: 18, opacity: 0.07, userSelect: 'none' }}>🐾🐾🐾</div>

          {/* Selo */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 72, height: 72, borderRadius: '50%', fontSize: 34,
            background: 'radial-gradient(circle, rgba(201,168,76,0.2) 0%, transparent 70%)',
            border: '2px solid rgba(201,168,76,0.4)', marginBottom: 14,
          }}>🏅</div>

          <div style={{ fontSize: 10, fontFamily: 'system-ui, sans-serif', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.7)', marginBottom: 4 }}>
            ✦ Certificado Oficial ✦
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#e8c776', margin: '0 0 4px', textShadow: '0 0 20px rgba(201,168,76,0.4)' }}>
            PsiCanino
          </h2>
          <p style={{ fontSize: 11, fontFamily: 'system-ui, sans-serif', color: 'rgba(245,240,224,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
            CRP — Conselho Regional dos Pets
          </p>
        </div>

        {/* ── Corpo ────────────────────────────────────────────────── */}
        <div style={{ padding: '22px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Nome */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 12, fontFamily: 'system-ui, sans-serif', color: 'rgba(245,240,224,0.5)', marginBottom: 4 }}>
              A Dra. Agatha PsiCanina certifica que
            </p>
            <div style={{ borderBottom: '1.5px solid rgba(201,168,76,0.4)', paddingBottom: 6, marginBottom: 10 }}>
              <p style={{ fontSize: 24, fontWeight: 700, color: '#e8c776', margin: 0, textShadow: '0 0 16px rgba(201,168,76,0.3)' }}>
                {patientName}
              </p>
            </div>
            <p style={{ fontSize: 12, fontFamily: 'system-ui, sans-serif', color: 'rgba(245,240,224,0.5)', margin: 0 }}>
              foi oficialmente diagnosticado(a) como:
            </p>
          </div>

          {/* Arquétipo */}
          <div style={{
            background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.25)',
            borderRadius: 12, padding: '12px 18px', textAlign: 'center',
          }}>
            <p style={{ fontSize: 9, fontFamily: 'system-ui, sans-serif', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.6)', margin: '0 0 6px' }}>
              🐾 Arquétipo Canino
            </p>
            <p style={{ fontSize: 17, fontWeight: 700, color: '#f5f0e0', margin: 0, lineHeight: 1.3 }}>
              {diagnosis.arquetipoCanino}
            </p>
          </div>

          {/* Nível de Drama */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 9, fontFamily: 'system-ui, sans-serif', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.6)', marginBottom: 8 }}>
              🎭 Nível de Drama
            </p>
            <DramaStars level={diagnosis.nivelDrama} />
            <p style={{ fontSize: 11, fontFamily: 'system-ui, sans-serif', color: 'rgba(245,240,224,0.4)', marginTop: 4 }}>
              {diagnosis.nivelDrama}/10
            </p>
          </div>

          {/* ── Raridade ──────────────────────────────────────────── */}
          <div style={{
            background: `linear-gradient(135deg, ${rm.glow} 0%, transparent 100%)`,
            border: `1.5px solid ${rm.color}44`,
            borderRadius: 14, padding: '14px 18px',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 9, fontFamily: 'system-ui, sans-serif', letterSpacing: '0.12em', textTransform: 'uppercase', color: `${rm.color}99`, margin: '0 0 6px' }}>
                🏅 Raridade Psi-Canina
              </p>
              <Stars count={rm.stars} color={rm.color} />
              <p style={{ fontSize: 16, fontWeight: 800, color: rm.color, margin: '4px 0 0', fontFamily: 'system-ui, sans-serif', letterSpacing: '0.06em', textShadow: `0 0 12px ${rm.glow}` }}>
                {rm.label}
              </p>
            </div>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: `radial-gradient(circle, ${rm.glow} 0%, transparent 70%)`,
              border: `1.5px solid ${rm.color}55`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, flexShrink: 0,
            }}>
              {rarity === 'LENDARIO' ? '👑' : rarity === 'EPICO' ? '💜' : rarity === 'RARO' ? '💎' : '🔮'}
            </div>
          </div>

          {/* Divisória */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(201,168,76,0.3)', fontSize: 11 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(201,168,76,0.18)' }} />
            <span>✦ ✦ ✦</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(201,168,76,0.18)' }} />
          </div>

          {/* Prescrição */}
          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 12, padding: '14px 16px',
          }}>
            <p style={{ fontSize: 9, fontFamily: 'system-ui, sans-serif', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.55)', margin: '0 0 8px' }}>
              💊 Prescrição Oficial
            </p>
            <p style={{ fontSize: 13, fontStyle: 'italic', color: 'rgba(245,240,224,0.85)', lineHeight: 1.65, margin: 0 }}>
              {diagnosis.prescricao}
            </p>
          </div>

          {/* ── Perfil Psi-Canino ─────────────────────────────────── */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(74,144,217,0.08) 0%, rgba(155,89,182,0.08) 100%)',
            border: '1px solid rgba(155,89,182,0.25)',
            borderRadius: 14, padding: '16px 18px',
          }}>
            <p style={{ fontSize: 9, fontFamily: 'system-ui, sans-serif', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(195,155,211,0.7)', margin: '0 0 14px' }}>
              🐾 Perfil Psi-Canino
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Pão de queijo */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, fontFamily: 'system-ui, sans-serif', color: 'rgba(245,240,224,0.7)' }}>
                    🥐 Compatibilidade com pão de queijo
                  </span>
                </div>
                <IndicatorBar value={compatibilidadePaoQueijo} color="#e8c776" />
              </div>

              {/* Estudar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, fontFamily: 'system-ui, sans-serif', color: 'rgba(245,240,224,0.7)' }}>
                    📚 Chance de estudar até tarde
                  </span>
                </div>
                <IndicatorBar value={chanceEstudarMadrugada} color="#4a90d9" />
              </div>

              {/* Cachorro */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, fontFamily: 'system-ui, sans-serif', color: 'rgba(245,240,224,0.7)' }}>
                    🐶 Risco de adotar outro cachorro
                  </span>
                </div>
                <IndicatorBar value={riscoAdotarOutroCachorro} color="#c39bd3" />
              </div>
            </div>
          </div>

          {/* Frase */}
          <div style={{ borderLeft: '3px solid rgba(201,168,76,0.4)', paddingLeft: 14 }}>
            <p style={{ fontSize: 13, fontStyle: 'italic', color: 'rgba(245,240,224,0.7)', lineHeight: 1.6, margin: 0 }}>
              "{diagnosis.fraseCompartilhavel}"
            </p>
          </div>

          {/* Assinatura */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: '"Comic Sans MS", "Brush Script MT", cursive',
              fontSize: 20, color: '#e8c776', opacity: 0.85, letterSpacing: '0.05em', marginBottom: 4,
            }}>
              Agatha PsiCanina
            </div>
            <div style={{ height: 1, background: 'rgba(201,168,76,0.35)', marginBottom: 4 }} />
            <p style={{ fontSize: 11, fontFamily: 'system-ui, sans-serif', color: 'rgba(245,240,224,0.5)', margin: 0 }}>
              Dra. Agatha PsiCanina<br />
              <span style={{ fontSize: 10, color: 'rgba(245,240,224,0.35)' }}>Especialista em Comportamento Humano Estranho</span>
            </p>
          </div>

          {/* Data + Prontuário */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: '📅 Data da Consulta', value: formatDate(createdAt) },
              { label: '📋 Prontuário', value: `#${certificateNumber}`, mono: true },
            ].map(({ label, value, mono }) => (
              <div key={label} style={{
                background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.14)',
                borderRadius: 8, padding: '10px 12px',
              }}>
                <p style={{ fontSize: 9, fontFamily: 'system-ui, sans-serif', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.45)', margin: '0 0 3px' }}>
                  {label}
                </p>
                <p style={{ fontSize: 12, color: 'rgba(245,240,224,0.8)', margin: 0, fontFamily: mono ? 'monospace' : 'inherit' }}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Rodapé ──────────────────────────────────────────────── */}
        <div style={{
          borderTop: '1px solid rgba(201,168,76,0.12)', background: 'rgba(201,168,76,0.04)',
          padding: '10px 24px', textAlign: 'center',
        }}>
          <p style={{ fontSize: 10, fontFamily: 'system-ui, sans-serif', color: 'rgba(245,240,224,0.28)', margin: 0, lineHeight: 1.7 }}>
            Documento emitido pela Dra. Agatha PsiCanina, especialista em comportamento humano estranho.<br />
            Validade emocional indeterminada. 🐾 Não é psicologia real.
          </p>
        </div>
      </div>
    )
  },
)

CertificateCard.displayName = 'CertificateCard'
