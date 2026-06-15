'use client'

import { useState, useCallback, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { CertificateModal } from '@/components/certificate/CertificateModal'
import type { CertificateData } from '@/components/certificate/CertificateCard'
import type { DiagnosisPayload } from '@/hooks/useChatSession'
import type { Rarity } from '@/lib/certificate-indicators'
import { ACHIEVEMENTS } from '@/lib/achievements'
import { AchievementsGrid } from '@/components/achievements/AchievementsGrid'
import { AchievementToast } from '@/components/achievements/AchievementToast'

// ─── Tipos ────────────────────────────────────────────────────────────────────

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

type SortOption = 'recent' | 'oldest' | 'drama_high' | 'drama_low'
type RarityFilter = 'ALL' | Rarity

interface Props {
  consultas: ConsultaItem[]
  hasPatient: boolean
  unlockedIds: string[]
  newlyUnlockedIds: string[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatMonthYear(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
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

function dramaColor(n: number): string {
  if (n <= 3) return '#27ae60'
  if (n <= 6) return '#f0b429'
  if (n <= 8) return '#e67e22'
  return '#e74c3c'
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

function computeFullStats(consultas: ConsultaItem[]) {
  const total = consultas.length
  const certs = consultas.filter((c) => c.certificate !== null).length
  const dramas = consultas.map((c) => c.diagnosis.nivelDrama)
  const dramaMedia = total > 0
    ? Math.round(dramas.reduce((s, v) => s + v, 0) / total * 10) / 10
    : 0
  const dramaMax = total > 0 ? Math.max(...dramas) : 0
  const dramaMin = total > 0 ? Math.min(...dramas) : 0

  const freq: Record<string, { count: number; first: string; last: string }> = {}
  for (const c of consultas) {
    const a = c.diagnosis.arquetipoCanino
    if (!a) continue
    if (!freq[a]) freq[a] = { count: 0, first: c.diagnosis.createdAt, last: c.diagnosis.createdAt }
    freq[a].count++
    if (c.diagnosis.createdAt < freq[a].first) freq[a].first = c.diagnosis.createdAt
    if (c.diagnosis.createdAt > freq[a].last) freq[a].last = c.diagnosis.createdAt
  }

  const freqEntries = Object.entries(freq).sort((a, b) => b[1].count - a[1].count)
  const arquetipoTop = freqEntries[0] ?? null
  const uniqueArquetipos = freqEntries.length

  // consultas vem sorted desc — último é o mais antigo
  const oldest = consultas[consultas.length - 1]?.diagnosis.createdAt ?? null
  const newest = consultas[0]?.diagnosis.createdAt ?? null

  return { total, certs, dramaMedia, dramaMax, dramaMin, arquetipoTop, uniqueArquetipos, oldest, newest }
}

// ─── Mini barra de indicador ──────────────────────────────────────────────────

function IndicatorBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 11, color: 'rgba(240,240,255,0.4)', width: 130, flexShrink: 0 }}>
        {label}
      </span>
      <div style={{
        flex: 1, height: 5, borderRadius: 999,
        background: 'rgba(255,255,255,0.07)', overflow: 'hidden', minWidth: 40,
      }}>
        <div style={{ width: `${value}%`, height: '100%', borderRadius: 999, background: color, opacity: 0.85 }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color, minWidth: 30, textAlign: 'right' }}>
        {value}%
      </span>
    </div>
  )
}

// ─── 1. Dashboard Summary ──────────────────────────────────────────────────────

function DashboardSummary({ consultas }: { consultas: ConsultaItem[] }) {
  const { total, certs, dramaMedia, arquetipoTop } = computeFullStats(consultas)

  const cards = [
    { icon: '🗂️', value: String(total),         label: 'Consultas',      color: '#4a90d9' },
    { icon: '🏅', value: String(certs),          label: 'Certificados',   color: '#e8c776' },
    { icon: '🎭', value: `${dramaMedia}/10`,     label: 'Drama Médio',    color: '#9b59b6' },
    { icon: '🐾', value: arquetipoTop ? arquetipoTop[0].split(' ').slice(0, 2).join(' ') : '—',
                         label: 'Arquétipo Fav.', color: '#c39bd3' },
  ]

  return (
    <section style={{ marginBottom: 24 }}>
      <p style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
        color: 'rgba(201,168,76,0.55)', margin: '0 0 12px',
      }}>
        ✦ Resumo PsiCanino
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {cards.map(({ icon, value, label, color }) => (
          <div key={label} style={{
            background: 'linear-gradient(145deg, rgba(19,13,38,0.92) 0%, rgba(26,14,50,0.92) 100%)',
            border: `1px solid ${color}22`,
            borderRadius: 14,
            padding: '14px 12px',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 5, textAlign: 'center',
          }}>
            <span style={{ fontSize: 22, lineHeight: 1 }}>{icon}</span>
            <span style={{ fontSize: 20, fontWeight: 800, color, lineHeight: 1 }}>{value}</span>
            <span style={{ fontSize: 10, color: 'rgba(240,240,255,0.35)' }}>{label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── 2. Evolução Emocional (Timeline) ────────────────────────────────────────

function EmocionalTimeline({ consultas }: { consultas: ConsultaItem[] }) {
  // Pegar as últimas 10, exibir da mais antiga → mais recente
  const last10 = consultas.slice(0, 10).reverse()

  return (
    <section style={{ marginBottom: 24 }}>
      <p style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
        color: 'rgba(201,168,76,0.55)', margin: '0 0 12px',
      }}>
        ✦ Evolução Emocional
      </p>

      <div style={{
        background: 'linear-gradient(145deg, rgba(19,13,38,0.92) 0%, rgba(26,14,50,0.92) 100%)',
        border: '1px solid rgba(201,168,76,0.14)',
        borderRadius: 14,
        padding: '16px 14px',
        overflowX: 'auto',
      }}>
        {/* Linha de tempo horizontal */}
        <div style={{
          display: 'flex',
          gap: 0,
          minWidth: last10.length > 4 ? `${last10.length * 88}px` : 'auto',
          position: 'relative',
          paddingBottom: 8,
        }}>
          {/* Linha base */}
          <div style={{
            position: 'absolute',
            top: 18,
            left: 18,
            right: 18,
            height: 2,
            background: 'rgba(255,255,255,0.06)',
            zIndex: 0,
          }} />

          {last10.map((item, i) => {
            const d = item.diagnosis
            const color = dramaColor(d.nivelDrama)
            return (
              <div key={item.sessionId} style={{
                flex: 1,
                minWidth: 80,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 6, position: 'relative', zIndex: 1,
              }}>
                {/* Dot */}
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: `${color}18`,
                  border: `2px solid ${color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800, color,
                  boxShadow: `0 0 10px ${color}40`,
                  flexShrink: 0,
                }}>
                  {d.nivelDrama}
                </div>

                {/* Data */}
                <span style={{ fontSize: 9, color: 'rgba(240,240,255,0.3)', textAlign: 'center', lineHeight: 1.2 }}>
                  {formatMonthYear(d.createdAt)}
                </span>

                {/* Arquétipo */}
                <span style={{
                  fontSize: 9, color: 'rgba(240,240,255,0.55)', textAlign: 'center', lineHeight: 1.3,
                  maxWidth: 72,
                  overflow: 'hidden', display: '-webkit-box',
                  WebkitBoxOrient: 'vertical', WebkitLineClamp: 2,
                } as React.CSSProperties}>
                  {d.arquetipoCanino}
                </span>

                {/* Índice */}
                {i === 0 && (
                  <span style={{ fontSize: 8, color: 'rgba(240,240,255,0.2)', fontStyle: 'italic' }}>início</span>
                )}
                {i === last10.length - 1 && last10.length > 1 && (
                  <span style={{ fontSize: 8, color: 'rgba(201,168,76,0.5)', fontStyle: 'italic' }}>agora</span>
                )}
              </div>
            )
          })}
        </div>

        {/* Legenda de cores */}
        <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
          {[
            { label: '1–3 Zen', color: '#27ae60' },
            { label: '4–6 Moderado', color: '#f0b429' },
            { label: '7–8 Intenso', color: '#e67e22' },
            { label: '9–10 Novela', color: '#e74c3c' },
          ].map(({ label, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
              <span style={{ fontSize: 9, color: 'rgba(240,240,255,0.35)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── 3. Perfil Predominante ───────────────────────────────────────────────────

function PerfilPredominante({ consultas }: { consultas: ConsultaItem[] }) {
  const { arquetipoTop } = computeFullStats(consultas)
  if (!arquetipoTop) return null

  const [name, data] = arquetipoTop

  return (
    <section style={{ marginBottom: 24 }}>
      <p style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
        color: 'rgba(201,168,76,0.55)', margin: '0 0 12px',
      }}>
        ✦ Perfil Predominante
      </p>

      <div style={{
        background: 'linear-gradient(145deg, rgba(26,14,50,0.95) 0%, rgba(38,20,68,0.95) 100%)',
        border: '1px solid rgba(201,168,76,0.25)',
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Faixa topo dourada */}
        <div style={{ height: 3, background: 'linear-gradient(90deg, #9b59b688, #e8c776)' }} />

        <div style={{ padding: '18px 16px' }}>
          {/* Ícone + arquétipo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(155,89,182,0.1))',
              border: '1.5px solid rgba(201,168,76,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26,
              boxShadow: '0 0 20px rgba(201,168,76,0.12)',
            }}>
              🐾
            </div>
            <div>
              <p style={{ fontSize: 10, color: 'rgba(201,168,76,0.6)', margin: '0 0 4px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Arquétipo mais frequente
              </p>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#f0f0ff', margin: 0, lineHeight: 1.3 }}>
                {name}
              </h3>
            </div>
          </div>

          {/* Stats do arquétipo */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {[
              { label: 'Ocorrências', value: `${data.count}x`, color: '#e8c776' },
              { label: 'Primeira vez', value: formatDateShort(data.first), color: '#4a90d9' },
              { label: 'Última vez',   value: formatDateShort(data.last),  color: '#c39bd3' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                padding: '10px 8px',
                background: `${color}0a`,
                border: `1px solid ${color}20`,
                borderRadius: 10,
                textAlign: 'center',
              }}>
                <p style={{ fontSize: 13, fontWeight: 800, color, margin: '0 0 3px', lineHeight: 1 }}>{value}</p>
                <p style={{ fontSize: 9, color: 'rgba(240,240,255,0.35)', margin: 0 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── 4. Bloco de Estatísticas ─────────────────────────────────────────────────

function EstatisticasBlock({ consultas }: { consultas: ConsultaItem[] }) {
  const { dramaMax, dramaMin, uniqueArquetipos, oldest, newest } = computeFullStats(consultas)

  const items = [
    { icon: '🐕', label: 'Arquétipos diferentes',  value: `${uniqueArquetipos} descobertos` },
    { icon: '🔥', label: 'Maior drama registrado',  value: `${dramaMax}/10` },
    { icon: '☮️', label: 'Menor drama registrado',  value: `${dramaMin}/10` },
    { icon: '📅', label: 'Primeira consulta',        value: oldest ? formatDateShort(oldest) : '—' },
    { icon: '🕐', label: 'Última consulta',          value: newest ? formatDateShort(newest) : '—' },
  ]

  return (
    <section style={{ marginBottom: 24 }}>
      <p style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
        color: 'rgba(201,168,76,0.55)', margin: '0 0 12px',
      }}>
        ✦ Estatísticas PsiCaninas
      </p>

      <div style={{
        background: 'linear-gradient(145deg, rgba(19,13,38,0.92) 0%, rgba(26,14,50,0.92) 100%)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 14,
        overflow: 'hidden',
      }}>
        {items.map(({ icon, label, value }, i) => (
          <div key={label} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: i < items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
            gap: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 16, lineHeight: 1 }}>{icon}</span>
              <span style={{ fontSize: 12, color: 'rgba(240,240,255,0.45)' }}>{label}</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#f0f0ff', flexShrink: 0 }}>{value}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── 5. Search & Filters ──────────────────────────────────────────────────────

interface FiltersProps {
  search: string
  onSearch: (v: string) => void
  rarity: RarityFilter
  onRarity: (v: RarityFilter) => void
  sort: SortOption
  onSort: (v: SortOption) => void
  totalVisible: number
  totalAll: number
}

const RARITY_OPTIONS: { value: RarityFilter; label: string }[] = [
  { value: 'ALL',      label: 'Todos' },
  { value: 'COMUM',    label: 'Comum' },
  { value: 'RARO',     label: 'Raro' },
  { value: 'EPICO',    label: 'Épico' },
  { value: 'LENDARIO', label: 'Lendário' },
]

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'recent',     label: '↓ Mais recente' },
  { value: 'oldest',     label: '↑ Mais antigo' },
  { value: 'drama_high', label: '🔥 Maior drama' },
  { value: 'drama_low',  label: '☮️ Menor drama' },
]

function FiltersBar({ search, onSearch, rarity, onRarity, sort, onSort, totalVisible, totalAll }: FiltersProps) {
  return (
    <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Campo de busca */}
      <input
        type="text"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="🔍 Buscar por arquétipo..."
        style={{
          width: '100%', padding: '10px 14px', boxSizing: 'border-box',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 11, color: '#f0f0ff', fontSize: 13, outline: 'none',
          fontFamily: 'system-ui, sans-serif',
        }}
      />

      {/* Filtros de raridade */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {RARITY_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onRarity(value)}
            style={{
              padding: '5px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600,
              cursor: 'pointer', border: '1px solid',
              borderColor: rarity === value ? 'rgba(201,168,76,0.6)' : 'rgba(255,255,255,0.1)',
              background: rarity === value ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.03)',
              color: rarity === value ? '#e8c776' : 'rgba(240,240,255,0.4)',
              transition: 'all 0.15s ease',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Ordenação + contador */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
        <select
          value={sort}
          onChange={(e) => onSort(e.target.value as SortOption)}
          style={{
            padding: '6px 10px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 9, color: 'rgba(240,240,255,0.6)',
            fontSize: 12, cursor: 'pointer', outline: 'none',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          {SORT_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value} style={{ background: '#130d26' }}>{label}</option>
          ))}
        </select>

        <span style={{ fontSize: 11, color: 'rgba(240,240,255,0.3)' }}>
          {totalVisible === totalAll ? `${totalAll} consulta${totalAll !== 1 ? 's' : ''}` : `${totalVisible} de ${totalAll}`}
        </span>
      </div>
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
  const dColor = dramaColor(d.nivelDrama)

  return (
    <div style={{
      background: 'linear-gradient(145deg, rgba(19,19,37,0.97) 0%, rgba(26,18,46,0.97) 100%)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 18, overflow: 'hidden',
    }}>
      {/* Faixa topo */}
      <div style={{
        height: 3,
        background: cert
          ? `linear-gradient(90deg, ${cert.rarityColor}55, ${cert.rarityColor}dd)`
          : 'linear-gradient(90deg, rgba(74,144,217,0.3), rgba(155,89,182,0.4))',
      }} />

      <div style={{ padding: '16px 18px 18px' }}>
        {/* Cabeçalho: número + raridade */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 8 }}>
          {cert ? (
            <span style={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 700, color: cert.rarityColor, letterSpacing: '0.06em' }}>
              #{cert.certificateNumber}
            </span>
          ) : (
            <span style={{ fontSize: 10, color: 'rgba(245,240,224,0.25)', fontStyle: 'italic' }}>
              sem certificado
            </span>
          )}
          {cert && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: `${cert.rarityColor}12`, border: `1px solid ${cert.rarityColor}40`,
              borderRadius: 999, padding: '3px 9px', flexShrink: 0,
            }}>
              <span style={{ fontSize: 9 }}>{'⭐'.repeat(cert.rarityStars)}</span>
              <span style={{ fontSize: 9, fontWeight: 800, color: cert.rarityColor, letterSpacing: '0.08em' }}>
                {cert.rarityLabel}
              </span>
            </div>
          )}
        </div>

        {/* Arquétipo */}
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f0f0ff', margin: '0 0 8px', lineHeight: 1.3 }}>
          🐾 {d.arquetipoCanino}
        </h3>

        {/* Drama pill colorido */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: hasCertIndicators ? 12 : 10, flexWrap: 'wrap' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: `${dColor}14`, border: `1px solid ${dColor}44`,
            borderRadius: 999, padding: '3px 10px',
          }}>
            <span style={{ fontSize: 11 }}>{dramaEmoji(d.nivelDrama)}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: dColor }}>
              Drama {d.nivelDrama}/10
            </span>
            <span style={{ fontSize: 10, color: `${dColor}99` }}>
              · {dramaLabel(d.nivelDrama)}
            </span>
          </div>
        </div>

        {/* Indicadores compactos */}
        {hasCertIndicators && (
          <div style={{
            display: 'flex', gap: 8, flexWrap: 'wrap',
            marginBottom: 12,
          }}>
            {[
              { icon: '🥐', value: cert!.compatibilidadePaoQueijo, color: '#e8c776' },
              { icon: '📚', value: cert!.chanceEstudarMadrugada, color: '#4a90d9' },
              { icon: '🐶', value: cert!.riscoAdotarOutroCachorro, color: '#e67e73' },
            ].map(({ icon, value, color }) => (
              <div key={icon} style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '3px 9px', borderRadius: 999,
                background: `${color}10`, border: `1px solid ${color}28`,
              }}>
                <span style={{ fontSize: 11 }}>{icon}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color }}>{value}%</span>
              </div>
            ))}
          </div>
        )}

        {/* Frase */}
        <p style={{
          fontSize: 12, fontStyle: 'italic', color: 'rgba(240,240,255,0.38)',
          margin: '0 0 10px', lineHeight: 1.55,
          overflow: 'hidden', display: '-webkit-box',
          WebkitBoxOrient: 'vertical', WebkitLineClamp: 2,
        } as React.CSSProperties}>
          "{d.fraseCompartilhavel}"
        </p>

        {/* Data */}
        <p style={{ fontSize: 11, color: 'rgba(240,240,255,0.22)', margin: '0 0 14px' }}>
          📅 {formatDate(d.createdAt)}
        </p>

        {/* Botões */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <a
            href={`/diagnostico/${d.shareToken}`}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '10px', borderRadius: 11,
              border: '1px solid rgba(74,144,217,0.3)',
              background: 'rgba(74,144,217,0.07)',
              color: '#4a90d9', fontSize: 12, fontWeight: 600, textDecoration: 'none',
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
                  border: `1px solid ${certColor}44`, background: `${certColor}0d`,
                  color: certColor, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}
              >
                🏅 Certificado
              </button>
              <button
                onClick={() => onViewCert(item)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  padding: '10px', borderRadius: 11,
                  border: '1px solid rgba(37,211,102,0.28)', background: 'rgba(37,211,102,0.06)',
                  color: '#25D366', fontSize: 12, fontWeight: 600, cursor: 'pointer',
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
                border: '1px solid rgba(201,168,76,0.38)', background: 'rgba(201,168,76,0.09)',
                color: '#e8c776', fontSize: 12, fontWeight: 700, cursor: 'pointer',
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

// ─── 6. Empty State ───────────────────────────────────────────────────────────

function EmptyState({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      textAlign: 'center', padding: '56px 16px 40px', gap: 20,
    }}>
      <div style={{ fontSize: 72, lineHeight: 1, filter: 'drop-shadow(0 0 24px rgba(155,89,182,0.3))' }}>🐾</div>
      <div style={{ maxWidth: 360 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#f0f0ff', margin: '0 0 10px' }}>
          Nenhum prontuário encontrado
        </h2>
        <p style={{ fontSize: 13, color: 'rgba(240,240,255,0.45)', margin: 0, lineHeight: 1.7 }}>
          {isAuthenticated
            ? <>A Dra. Agatha ainda não teve a oportunidade de investigar
                seu comportamento humano.<br />
                <span style={{ color: 'rgba(201,168,76,0.7)' }}>O divã está esperando. 🛋️</span></>
            : <>Crie uma conta para salvar seu histórico em qualquer dispositivo.<br />
                <span style={{ color: 'rgba(201,168,76,0.7)' }}>Ou consulte anonimamente — mas o histórico fica no cookie. 🍪</span></>
          }
        </p>
      </div>

      <a
        href="/chat"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 9,
          padding: '14px 32px', borderRadius: 14,
          fontSize: 14, fontWeight: 700,
          background: 'linear-gradient(135deg, #4a90d9, #9b59b6)',
          color: '#fff', textDecoration: 'none',
          boxShadow: '0 4px 24px rgba(74,144,217,0.3)',
        }}
      >
        🛋️ Iniciar Primeira Consulta
      </a>

      {!isAuthenticated && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', marginTop: 4 }}>
          <a
            href="/register"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 28px', borderRadius: 14,
              fontSize: 13, fontWeight: 700, color: '#0d0b1e',
              background: 'linear-gradient(135deg, #e8c776, #c9a84c)',
              textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(201,168,76,0.2)',
            }}
          >
            🔑 Criar conta e salvar histórico
          </a>
          <a
            href="/login"
            style={{
              fontSize: 12, color: 'rgba(74,144,217,0.8)',
              textDecoration: 'none', fontWeight: 600,
            }}
          >
            Já tenho conta → Entrar
          </a>
        </div>
      )}
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function ProntuarioClient({ consultas, hasPatient, unlockedIds, newlyUnlockedIds }: Props) {
  const { data: session } = useSession()
  const isAuthenticated = !!session?.user?.id

  const [modalItem, setModalItem] = useState<ConsultaItem | null>(null)
  const [modalMode, setModalMode] = useState<'view' | 'generate'>('generate')
  const [search, setSearch] = useState('')
  const [rarityFilter, setRarityFilter] = useState<RarityFilter>('ALL')
  const [sort, setSort] = useState<SortOption>('recent')
  const toastAchievement = ACHIEVEMENTS.find((a) => newlyUnlockedIds.includes(a.id)) ?? null
  const [toastVisible, setToastVisible] = useState(true)
  const dismissToast = useCallback(() => setToastVisible(false), [])

  function handleViewCert(item: ConsultaItem) { setModalMode('view'); setModalItem(item) }
  function handleGenCert(item: ConsultaItem) { setModalMode('generate'); setModalItem(item) }

  const modalDiagnosis = modalItem ? toPayload(modalItem.diagnosis) : null
  const modalInitialData = modalItem?.certificate && modalMode === 'view'
    ? toCertData(modalItem, modalItem.certificate) : undefined

  // Filtro + ordenação client-side
  const filtered = useMemo(() => {
    let result = [...consultas]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((c) => c.diagnosis.arquetipoCanino.toLowerCase().includes(q))
    }

    if (rarityFilter !== 'ALL') {
      result = result.filter((c) => c.certificate?.rarity === rarityFilter)
    }

    result.sort((a, b) => {
      if (sort === 'oldest')     return new Date(a.diagnosis.createdAt).getTime() - new Date(b.diagnosis.createdAt).getTime()
      if (sort === 'drama_high') return b.diagnosis.nivelDrama - a.diagnosis.nivelDrama
      if (sort === 'drama_low')  return a.diagnosis.nivelDrama - b.diagnosis.nivelDrama
      return new Date(b.diagnosis.createdAt).getTime() - new Date(a.diagnosis.createdAt).getTime()
    })

    return result
  }, [consultas, search, rarityFilter, sort])

  return (
    <>
      <style>{`
        @keyframes fade-in { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .pront-page { animation: fade-in .35s ease both }
        .consulta-card { transition: transform 0.18s ease, border-color 0.18s ease }
        .consulta-card:hover { transform: translateY(-2px); border-color: rgba(255,255,255,0.14) !important }
        input::placeholder { color: rgba(240,240,255,0.25) }
        input:focus { border-color: rgba(201,168,76,0.4) !important }
      `}</style>

      <div
        className="pront-page"
        style={{ maxWidth: 620, margin: '0 auto', padding: '28px 14px 64px' }}
      >
        {/* ── Header ───────────────────────────────────────── */}
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
          <p style={{ fontSize: 13, color: 'rgba(240,240,255,0.42)', margin: 0, lineHeight: 1.65 }}>
            Ficha clínica oficial — tudo arquivado com carimbo e ética canina.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 20 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(201,168,76,0.12)' }} />
            <span style={{ fontSize: 10, color: 'rgba(201,168,76,0.3)' }}>✦ ✦ ✦</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(201,168,76,0.12)' }} />
          </div>
        </div>

        {/* ── Conteúdo ─────────────────────────────────────── */}
        {consultas.length === 0 ? (
          <EmptyState isAuthenticated={isAuthenticated} />
        ) : (
          <>
            <DashboardSummary consultas={consultas} />
            <PerfilPredominante consultas={consultas} />
            {consultas.length >= 2 && <EmocionalTimeline consultas={consultas} />}
            <EstatisticasBlock consultas={consultas} />

            {/* Seção de consultas com filtros */}
            <section>
              <p style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                color: 'rgba(201,168,76,0.55)', margin: '0 0 12px',
              }}>
                ✦ Histórico de Consultas
              </p>

              <FiltersBar
                search={search} onSearch={setSearch}
                rarity={rarityFilter} onRarity={setRarityFilter}
                sort={sort} onSort={setSort}
                totalVisible={filtered.length} totalAll={consultas.length}
              />

              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 16px', color: 'rgba(240,240,255,0.3)', fontSize: 13 }}>
                  Nenhuma consulta encontrada para esse filtro.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {filtered.map((item) => (
                    <div key={item.sessionId} className="consulta-card">
                      <ConsultaCard item={item} onViewCert={handleViewCert} onGenCert={handleGenCert} />
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {/* ── Conquistas ────────────────────────────────────── */}
        <div style={{ marginTop: 36, paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <AchievementsGrid unlockedIds={unlockedIds} />
        </div>

        {/* ── Rodapé ────────────────────────────────────────── */}
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

      {/* Modal */}
      {modalItem && modalDiagnosis && (
        <CertificateModal
          diagnosis={modalDiagnosis}
          shareToken={modalItem.diagnosis.shareToken}
          onClose={() => setModalItem(null)}
          initialCertificateData={modalInitialData}
        />
      )}

      {/* Toast */}
      {toastAchievement && toastVisible && (
        <AchievementToast achievement={toastAchievement} onDismiss={dismissToast} />
      )}
    </>
  )
}
