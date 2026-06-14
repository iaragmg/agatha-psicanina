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
  if (n <= 2) return 'Zen Total'
  if (n <= 4) return 'Tranquilo'
  if (n <= 6) return 'Moderado'
  if (n <= 8) return 'Intenso'
  return 'Novela das 9'
}

function dramaEmoji(n: number) {
  if (n <= 2) return '☮️'
  if (n <= 4) return '🌿'
  if (n <= 6) return '🌊'
  if (n <= 8) return '🔥'
  return '🎭'
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

function computeStats(consultas: ConsultaItem[]) {
  const total = consultas.length
  const certs = consultas.filter((c) => c.certificate !== null).length
  const dramaMedia = total > 0
    ? Math.round(consultas.reduce((s, c) => s + c.diagnosis.nivelDrama, 0) / total * 10) / 10
    : 0

  const freq: Record<string, number> = {}
  for (const c of consultas) {
    const a = c.diagnosis.arquetipoCanino
    if (a) freq[a] = (freq[a] ?? 0) + 1
  }
  const arquetipoTop = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

  return { total, certs, dramaMedia, arquetipoTop }
}

// ─── Mini barra de indicador ──────────────────────────────────────────────────

function IndicatorBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 11, color: 'rgba(240,240,255,0.4)', width: 140, flexShrink: 0 }}>
        {label}
      </span>
      <div style={{
        flex: 1, height: 5, borderRadius: 999,
        background: 'rgba(255,255,255,0.07)', overflow: 'hidden',
        minWidth: 40,
      }}>
        <div style={{
          width: `${value}%`, height: '100%', borderRadius: 999,
          background: color, opacity: 0.85,
        }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color, minWidth: 30, textAlign: 'right' }}>
        {value}%
      </span>
    </div>
  )
}

// ─── Painel de resumo ─────────────────────────────────────────────────────────

function SummaryPanel({ consultas }: { consultas: ConsultaItem[] }) {
  const { total, certs, dramaMedia, arquetipoTop } = computeStats(consultas)

  const stats = [
    { icon: '🗂️', label: 'Consultas', value: String(total), color: '#4a90d9' },
    { icon: '🏅', label: 'Certificados', value: String(certs), color: '#e8c776' },
    { icon: '🎭', label: 'Drama médio', value: `${dramaMedia}/10`, color: '#9b59b6' },
  ]

  return (
    <div style={{
      background: 'linear-gradient(145deg, rgba(19,13,38,0.9) 0%, rgba(26,14,50,0.9) 100%)',
      border: '1px solid rgba(201,168,76,0.18)',
      borderRadius: 16,
      padding: '18px 16px',
      marginBottom: 24,
    }}>
      {/* Linha de título */}
      <p style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
        color: 'rgba(201,168,76,0.6)', margin: '0 0 14px',
      }}>
        ✦ Resumo do Paciente
      </p>

      {/* Stats em linha */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 10,
        marginBottom: arquetipoTop ? 14 : 0,
      }}>
        {stats.map(({ icon, label, value, color }) => (
          <div key={label} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '10px 6px',
            background: `${color}0d`,
            border: `1px solid ${color}22`,
            borderRadius: 12,
            gap: 4,
          }}>
            <span style={{ fontSize: 20, lineHeight: 1 }}>{icon}</span>
            <span style={{ fontSize: 16, fontWeight: 800, color, lineHeight: 1 }}>{value}</span>
            <span style={{ fontSize: 10, color: 'rgba(240,240,255,0.35)', textAlign: 'center' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Arquétipo mais recorrente */}
      {arquetipoTop && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '9px 12px',
          background: 'rgba(155,89,182,0.08)',
          border: '1px solid rgba(155,89,182,0.2)',
          borderRadius: 10,
        }}>
          <span style={{ fontSize: 15 }}>🐾</span>
          <div>
            <span style={{ fontSize: 10, color: 'rgba(240,240,255,0.35)', display: 'block', lineHeight: 1, marginBottom: 2 }}>
              Arquétipo recorrente
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#c39bd3', lineHeight: 1 }}>
              {arquetipoTop}
            </span>
          </div>
        </div>
      )}
    </div>
  )
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
  const hasCertIndicators = cert && cert.compatibilidadePaoQueijo > 0

  return (
    <div style={{
      background: 'linear-gradient(145deg, rgba(19,19,37,0.97) 0%, rgba(26,18,46,0.97) 100%)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 18,
      overflow: 'hidden',
    }}>
      {/* Faixa decorativa topo */}
      <div style={{
        height: 3,
        background: cert
          ? `linear-gradient(90deg, ${cert.rarityColor}55, ${cert.rarityColor}dd)`
          : 'linear-gradient(90deg, rgba(74,144,217,0.3), rgba(155,89,182,0.4))',
      }} />

      <div style={{ padding: '16px 18px 18px' }}>

        {/* ── Linha de cabeçalho: número + raridade ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 8 }}>
          {cert ? (
            <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: cert.rarityColor, letterSpacing: '0.06em' }}>
              #{cert.certificateNumber}
            </span>
          ) : (
            <span style={{ fontSize: 10, color: 'rgba(245,240,224,0.3)', fontStyle: 'italic' }}>
              sem certificado
            </span>
          )}

          {cert && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: `${cert.rarityColor}12`,
              border: `1px solid ${cert.rarityColor}40`,
              borderRadius: 999, padding: '3px 9px', flexShrink: 0,
            }}>
              <span style={{ fontSize: 9 }}>{'⭐'.repeat(cert.rarityStars)}</span>
              <span style={{ fontSize: 9, fontWeight: 800, color: cert.rarityColor, letterSpacing: '0.08em' }}>
                {cert.rarityLabel}
              </span>
            </div>
          )}
        </div>

        {/* ── Arquétipo ── */}
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f0f0ff', margin: '0 0 8px', lineHeight: 1.3 }}>
          🐾 {d.arquetipoCanino}
        </h3>

        {/* ── Drama ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: hasCertIndicators ? 12 : 10 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: 'rgba(155,89,182,0.1)',
            border: '1px solid rgba(155,89,182,0.2)',
            borderRadius: 999, padding: '3px 10px',
          }}>
            <span style={{ fontSize: 11 }}>{dramaEmoji(d.nivelDrama)}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#c39bd3' }}>
              {d.nivelDrama}/10
            </span>
            <span style={{ fontSize: 10, color: 'rgba(240,240,255,0.35)' }}>
              · {dramaLabel(d.nivelDrama)}
            </span>
          </div>
        </div>

        {/* ── Indicadores psi-caninos ── */}
        {hasCertIndicators && (
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 7,
            padding: '10px 12px',
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.055)',
            borderRadius: 10,
            marginBottom: 12,
          }}>
            <IndicatorBar label="🥐 Pão de queijo"      value={cert!.compatibilidadePaoQueijo} color="#e8c776" />
            <IndicatorBar label="📚 Estudar até tarde"  value={cert!.chanceEstudarMadrugada}   color="#4a90d9" />
            <IndicatorBar label="🐶 Adotar cachorro"    value={cert!.riscoAdotarOutroCachorro} color="#e67e73" />
          </div>
        )}

        {/* ── Frase compartilhável ── */}
        <p style={{
          fontSize: 12, fontStyle: 'italic', color: 'rgba(240,240,255,0.4)',
          margin: '0 0 10px', lineHeight: 1.55,
          overflow: 'hidden', display: '-webkit-box',
          WebkitBoxOrient: 'vertical', WebkitLineClamp: 2,
        } as React.CSSProperties}>
          "{d.fraseCompartilhavel}"
        </p>

        {/* ── Data ── */}
        <p style={{ fontSize: 11, color: 'rgba(240,240,255,0.25)', margin: '0 0 14px' }}>
          📅 {formatDate(d.createdAt)}
        </p>

        {/* ── Botões ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <a
            href={`/diagnostico/${d.shareToken}`}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '10px', borderRadius: 11,
              border: '1px solid rgba(74,144,217,0.3)',
              background: 'rgba(74,144,217,0.07)',
              color: '#4a90d9', fontSize: 12, fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            🔬 Ver Diagnóstico
          </a>

          {cert ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
              <button
                onClick={() => onViewCert(item)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  padding: '10px', borderRadius: 11,
                  border: `1px solid ${certColor}44`,
                  background: `${certColor}0d`,
                  color: certColor, fontSize: 12, fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                🏅 Certificado
              </button>
              <button
                onClick={() => onViewCert(item)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  padding: '10px', borderRadius: 11,
                  border: '1px solid rgba(37,211,102,0.28)',
                  background: 'rgba(37,211,102,0.06)',
                  color: '#25D366', fontSize: 12, fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                💬 Compartilhar
              </button>
            </div>
          ) : (
            <button
              onClick={() => onGenCert(item)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '10px', borderRadius: 11,
                border: '1px solid rgba(201,168,76,0.38)',
                background: 'rgba(201,168,76,0.09)',
                color: '#e8c776', fontSize: 12, fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              📜 Gerar Certificado
            </button>
          )}
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
      textAlign: 'center', padding: '48px 16px', gap: 20,
    }}>
      <div style={{ fontSize: 68, lineHeight: 1 }}>🛋️</div>
      <div>
        {hasPatient ? (
          <>
            <h2 style={{ fontSize: 19, fontWeight: 700, color: '#f0f0ff', margin: '0 0 8px' }}>
              Nenhuma consulta encontrada.
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(240,240,255,0.45)', margin: 0, lineHeight: 1.65 }}>
              Parece que a Agatha ainda não te atendeu por aqui.<br />
              Que tal marcar sua primeira sessão? 🐾
            </p>
          </>
        ) : (
          <>
            <h2 style={{ fontSize: 19, fontWeight: 700, color: '#f0f0ff', margin: '0 0 8px' }}>
              Prontuário não encontrado.
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(240,240,255,0.45)', margin: 0, lineHeight: 1.65 }}>
              Inicie uma consulta com a Agatha<br />
              e seu histórico aparecerá aqui. 🐶
            </p>
          </>
        )}
      </div>
      <a
        href="/chat"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '13px 28px', borderRadius: 14,
          fontSize: 14, fontWeight: 700,
          background: 'linear-gradient(135deg, #4a90d9, #9b59b6)',
          color: '#fff', textDecoration: 'none',
          boxShadow: '0 4px 20px rgba(74,144,217,0.25)',
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
        @keyframes fade-in { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .pront-page { animation: fade-in .35s ease both }
        .consulta-card { transition: transform 0.18s ease, border-color 0.18s ease }
        .consulta-card:hover { transform: translateY(-2px); border-color: rgba(255,255,255,0.14) !important }
      `}</style>

      <div
        className="pront-page"
        style={{ maxWidth: 620, margin: '0 auto', padding: '28px 14px 64px' }}
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <div style={{ marginBottom: 28 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: 'rgba(255,255,255,0.045)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 999, padding: '5px 14px', marginBottom: 18,
          }}>
            <span style={{ fontSize: 13 }}>🐾</span>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.85)' }}>
              Agatha PsiCanina
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: 800, color: '#f0f0ff', margin: '0 0 5px' }}>
            📚 Meu Prontuário PsiCanino
          </h1>

          <p style={{ fontSize: 12, color: 'rgba(201,168,76,0.75)', margin: '0 0 10px', fontWeight: 600, letterSpacing: '0.04em' }}>
            Dra. Agatha PsiCanina — CRP-PET 0001
          </p>

          <p style={{ fontSize: 13, color: 'rgba(240,240,255,0.45)', margin: 0, lineHeight: 1.65 }}>
            Suas consultas, diagnósticos e certificados — tudo arquivado com carimbo oficial.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 20 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(201,168,76,0.12)' }} />
            <span style={{ fontSize: 10, color: 'rgba(201,168,76,0.3)' }}>✦ ✦ ✦</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(201,168,76,0.12)' }} />
          </div>
        </div>

        {/* ── Conteúdo ────────────────────────────────────────── */}
        {consultas.length === 0 ? (
          <EmptyState hasPatient={hasPatient} />
        ) : (
          <>
            {/* Painel de resumo */}
            <SummaryPanel consultas={consultas} />

            {/* Lista de consultas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
          </>
        )}

        {/* ── Rodapé ─────────────────────────────────────────── */}
        <div style={{ marginTop: 44, textAlign: 'center' }}>
          <a
            href="/chat"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '11px 22px', borderRadius: 13,
              border: '1px solid rgba(255,255,255,0.07)',
              color: 'rgba(240,240,255,0.38)', fontSize: 13, fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            🔄 Nova consulta com a Agatha
          </a>
          <p style={{ fontSize: 10, color: 'rgba(240,240,255,0.18)', marginTop: 20, lineHeight: 1.7 }}>
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
