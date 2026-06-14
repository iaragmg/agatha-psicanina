'use client'

import { useState } from 'react'
import { CertificateModal } from '@/components/certificate/CertificateModal'
import type { CertificateData } from '@/components/certificate/CertificateCard'
import type { DiagnosisPayload } from '@/hooks/useChatSession'
import type { Rarity } from '@/lib/certificate-indicators'

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface ConsultaItem {
  sessionId: string
  diagnosis: {
    id: string
    shareToken: string
    arquetipoCanino: string
    nivelDrama: number
    fraseCompartilhavel: string
    diagnostico: string
    prescricao: string
    resumoAfetivo: string
    sintomas: string[]
    createdAt: string
  }
  certificate: {
    id: string
    certificateNumber: string
    patientName: string
    rarity: Rarity
    rarityLabel: string
    rarityStars: number
    rarityColor: string
    compatibilidadePaoQueijo: number
    chanceEstudarMadrugada: number
    riscoAdotarOutroCachorro: number
    createdAt: string
  } | null
}

interface Props {
  consultas: ConsultaItem[]
  hasPatient: boolean
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function dramaLabel(n: number) {
  if (n <= 2) return 'Zen Total ☮️'
  if (n <= 4) return 'Tranquilo 🌿'
  if (n <= 6) return 'Moderado 🌊'
  if (n <= 8) return 'Intenso 🔥'
  return 'Novela das 9 🎭'
}

function toPayload(d: ConsultaItem['diagnosis']): DiagnosisPayload {
  return {
    tipo: 'diagnostico',
    diagnostico: d.diagnostico,
    arquetipoCanino: d.arquetipoCanino,
    nivelDrama: d.nivelDrama,
    sintomas: d.sintomas,
    prescricao: d.prescricao,
    fraseCompartilhavel: d.fraseCompartilhavel,
    resumoAfetivo: d.resumoAfetivo,
  }
}

function toCertData(item: ConsultaItem, cert: NonNullable<ConsultaItem['certificate']>): CertificateData {
  return {
    diagnosis: toPayload(item.diagnosis),
    patientName: cert.patientName,
    certificateNumber: cert.certificateNumber,
    createdAt: cert.createdAt,
    rarity: cert.rarity,
    compatibilidadePaoQueijo: cert.compatibilidadePaoQueijo,
    chanceEstudarMadrugada: cert.chanceEstudarMadrugada,
    riscoAdotarOutroCachorro: cert.riscoAdotarOutroCachorro,
  }
}

// ─── Card de consulta ─────────────────────────────────────────────────────────

interface CardProps {
  item: ConsultaItem
  onViewCert: (item: ConsultaItem) => void
  onGenCert: (item: ConsultaItem) => void
}

function ConsultaCard({ item, onViewCert, onGenCert }: CardProps) {
  const { diagnosis: d, certificate: cert } = item
  const certColor = cert ? cert.rarityColor : 'rgba(255,255,255,0.25)'

  return (
    <div style={{
      background: 'linear-gradient(145deg, rgba(19,19,37,0.95) 0%, rgba(26,18,46,0.95) 100%)',
      backdropFilter: 'blur(24px)',
      border: '1px solid rgba(255,255,255,0.09)',
      borderRadius: 18,
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Linha decorativa topo */}
      <div style={{
        height: 3,
        background: cert
          ? `linear-gradient(90deg, ${cert.rarityColor}88, ${cert.rarityColor})`
          : 'linear-gradient(90deg, rgba(74,144,217,0.4), rgba(155,89,182,0.4))',
      }} />

      <div style={{ padding: '18px 20px' }}>
        {/* Cabeçalho do card */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, gap: 8 }}>
          {/* Número do prontuário */}
          <div>
            {cert ? (
              <span style={{
                fontFamily: 'monospace', fontSize: 12, fontWeight: 700,
                color: cert.rarityColor, letterSpacing: '0.04em',
              }}>
                #{cert.certificateNumber}
              </span>
            ) : (
              <span style={{
                fontSize: 11, color: 'rgba(245,240,224,0.35)',
                fontStyle: 'italic',
              }}>
                Certificado pendente
              </span>
            )}
          </div>

          {/* Badge de raridade */}
          {cert && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: `${cert.rarityColor}14`,
              border: `1px solid ${cert.rarityColor}44`,
              borderRadius: 999, padding: '3px 10px',
              flexShrink: 0,
            }}>
              <span style={{ fontSize: 10 }}>{'⭐'.repeat(cert.rarityStars)}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: cert.rarityColor, letterSpacing: '0.06em' }}>
                {cert.rarityLabel}
              </span>
            </div>
          )}
        </div>

        {/* Arquétipo */}
        <h3 style={{
          fontSize: 17, fontWeight: 700, color: '#f0f0ff',
          margin: '0 0 6px', lineHeight: 1.3,
        }}>
          🐾 {d.arquetipoCanino}
        </h3>

        {/* Drama */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: cert ? 10 : 6 }}>
          <span style={{ fontSize: 11, color: 'rgba(240,240,255,0.45)' }}>
            🎭 {d.nivelDrama}/10 · {dramaLabel(d.nivelDrama)}
          </span>
        </div>

        {/* Indicadores psi-caninos — só com certificado */}
        {cert && (
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 6,
            marginBottom: 10,
            padding: '10px 12px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 10,
          }}>
            {[
              { label: '🥐 Pão de queijo', value: cert.compatibilidadePaoQueijo, color: '#e8c776' },
              { label: '📚 Estudar até tarde', value: cert.chanceEstudarMadrugada, color: '#4a90d9' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: 'rgba(240,240,255,0.4)', flex: 1, whiteSpace: 'nowrap' }}>
                  {label}
                </span>
                <div style={{
                  flex: 2, height: 5, borderRadius: 999,
                  background: 'rgba(255,255,255,0.07)', overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${value}%`, height: '100%', borderRadius: 999,
                    background: color, opacity: 0.8,
                    transition: 'width 0.4s ease',
                  }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color, minWidth: 30, textAlign: 'right' }}>
                  {value}%
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Frase */}
        <p style={{
          fontSize: 12, fontStyle: 'italic',
          color: 'rgba(240,240,255,0.5)',
          margin: '0 0 10px',
          lineHeight: 1.5,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: 2,
        } as React.CSSProperties}>
          "{d.fraseCompartilhavel}"
        </p>

        {/* Data */}
        <p style={{ fontSize: 11, color: 'rgba(240,240,255,0.3)', margin: '0 0 16px' }}>
          📅 {formatDate(d.createdAt)}
        </p>

        {/* Botões */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Ver diagnóstico */}
          <a
            href={`/diagnostico/${d.shareToken}`}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '11px 14px', borderRadius: 12,
              border: '1px solid rgba(74,144,217,0.35)',
              background: 'rgba(74,144,217,0.08)',
              color: '#4a90d9', fontSize: 13, fontWeight: 600,
              textDecoration: 'none', transition: 'all 0.15s ease',
            }}
          >
            🔬 Ver Diagnóstico
          </a>

          <div style={{ display: 'grid', gridTemplateColumns: cert ? '1fr 1fr' : '1fr', gap: 8 }}>
            {cert ? (
              <>
                <button
                  onClick={() => onViewCert(item)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '10px', borderRadius: 12,
                    border: `1px solid ${certColor}44`,
                    background: `${certColor}10`,
                    color: certColor, fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.15s ease',
                  }}
                >
                  🏅 Ver Certificado
                </button>
                <button
                  onClick={() => onViewCert(item)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '10px', borderRadius: 12,
                    border: '1px solid rgba(37,211,102,0.3)',
                    background: 'rgba(37,211,102,0.07)',
                    color: '#25D366', fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.15s ease',
                  }}
                >
                  💬 Compartilhar
                </button>
              </>
            ) : (
              <button
                onClick={() => onGenCert(item)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '10px', borderRadius: 12,
                  border: '1px solid rgba(201,168,76,0.4)',
                  background: 'rgba(201,168,76,0.1)',
                  color: '#e8c776', fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', transition: 'all 0.15s ease',
                }}
              >
                📜 Gerar Certificado
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ hasPatient }: { hasPatient: boolean }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      textAlign: 'center', padding: '48px 24px', gap: 20,
    }}>
      <div style={{ fontSize: 72, lineHeight: 1 }}>🛋️</div>
      <div>
        {hasPatient ? (
          <>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#f0f0ff', margin: '0 0 8px' }}>
              Nenhuma consulta encontrada.
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(240,240,255,0.5)', margin: 0, lineHeight: 1.6 }}>
              Parece que a Agatha ainda não te atendeu por aqui.<br />
              Que tal marcar sua primeira sessão? 🐾
            </p>
          </>
        ) : (
          <>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#f0f0ff', margin: '0 0 8px' }}>
              Não consegui encontrar seu prontuário.
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(240,240,255,0.5)', margin: 0, lineHeight: 1.6 }}>
              Você pode iniciar uma nova consulta com a Agatha<br />
              e seu histórico aparecerá aqui. 🐶
            </p>
          </>
        )}
      </div>
      <a
        href="/chat"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '14px 28px', borderRadius: 14, border: 'none',
          fontSize: 15, fontWeight: 700,
          background: 'linear-gradient(135deg, #4a90d9, #9b59b6)',
          color: '#fff', textDecoration: 'none',
          boxShadow: '0 4px 24px rgba(74,144,217,0.3)',
        }}
      >
        🛋️ Iniciar Consulta
      </a>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function ProntuarioClient({ consultas, hasPatient }: Props) {
  const [modalItem, setModalItem] = useState<ConsultaItem | null>(null)
  const [modalMode, setModalMode] = useState<'view' | 'generate'>('generate')

  function handleViewCert(item: ConsultaItem) {
    setModalMode('view')
    setModalItem(item)
  }

  function handleGenCert(item: ConsultaItem) {
    setModalMode('generate')
    setModalItem(item)
  }

  const modalDiagnosis = modalItem ? toPayload(modalItem.diagnosis) : null
  const modalInitialData = modalItem?.certificate && modalMode === 'view'
    ? toCertData(modalItem, modalItem.certificate)
    : undefined

  return (
    <>
      <style>{`
        @keyframes fade-in { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .pront-page { animation: fade-in .4s ease both }
        .consulta-card:hover { border-color: rgba(255,255,255,0.15) !important; transform: translateY(-2px) }
        .consulta-card { transition: all 0.2s ease }
      `}</style>

      <div
        className="pront-page"
        style={{
          maxWidth: 640,
          margin: '0 auto',
          padding: '32px 16px 64px',
        }}
      >
        {/* ── Header ────────────────────────────────────────────── */}
        <div style={{ marginBottom: 36 }}>
          {/* Branding pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 999, padding: '6px 16px', marginBottom: 20,
          }}>
            <span style={{ fontSize: 14 }}>🐾</span>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.9)' }}>
              Agatha PsiCanina
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(22px, 5vw, 30px)',
            fontWeight: 800, color: '#f0f0ff', margin: '0 0 6px',
          }}>
            📚 Meu Prontuário PsiCanino
          </h1>

          <p style={{ fontSize: 13, color: 'rgba(201,168,76,0.8)', margin: '0 0 12px', fontWeight: 600, letterSpacing: '0.04em' }}>
            Dra. Agatha PsiCanina — CRP-PET 0001
          </p>

          <p style={{ fontSize: 13, color: 'rgba(240,240,255,0.5)', margin: 0, lineHeight: 1.65, maxWidth: 520 }}>
            Aqui ficam arquivadas suas consultas, diagnósticos e certificados emocionais.
            Tudo fictício, mas com carimbo oficial da Agatha.
          </p>

          {/* Linha divisória ornamental */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginTop: 24,
            color: 'rgba(201,168,76,0.25)',
          }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(201,168,76,0.15)' }} />
            <span style={{ fontSize: 11 }}>✦ ✦ ✦</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(201,168,76,0.15)' }} />
          </div>
        </div>

        {/* ── Contador de consultas ─────────────────────────────── */}
        {consultas.length > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20,
          }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(74,144,217,0.1)',
              border: '1px solid rgba(74,144,217,0.25)',
              borderRadius: 999, padding: '5px 14px',
            }}>
              <span style={{ fontSize: 14 }}>🗂️</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#4a90d9' }}>
                {consultas.length} {consultas.length === 1 ? 'consulta arquivada' : 'consultas arquivadas'}
              </span>
            </div>
          </div>
        )}

        {/* ── Lista ou empty state ──────────────────────────────── */}
        {consultas.length === 0 ? (
          <EmptyState hasPatient={hasPatient} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {consultas.map((item) => (
              <div key={item.sessionId} className="consulta-card">
                <ConsultaCard
                  item={item}
                  onViewCert={handleViewCert}
                  onGenCert={handleGenCert}
                />
              </div>
            ))}
          </div>
        )}

        {/* ── Rodapé ────────────────────────────────────────────── */}
        <div style={{ marginTop: 48, textAlign: 'center' }}>
          <a
            href="/chat"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 24px', borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(240,240,255,0.45)', fontSize: 13, fontWeight: 600,
              textDecoration: 'none', transition: 'color 0.2s',
            }}
          >
            🔄 Nova consulta com a Agatha
          </a>

          <p style={{ fontSize: 11, color: 'rgba(240,240,255,0.2)', marginTop: 24, lineHeight: 1.6 }}>
            🐾 Agatha PsiCanina é entretenimento.<br />
            Não substitui psicologia ou veterinária de verdade.
          </p>
        </div>
      </div>

      {/* Modal de certificado */}
      {modalItem && modalDiagnosis && (
        <CertificateModal
          diagnosis={modalDiagnosis}
          shareToken={modalItem.diagnosis.shareToken}
          onClose={() => setModalItem(null)}
          initialCertificateData={modalInitialData}
        />
      )}
    </>
  )
}
