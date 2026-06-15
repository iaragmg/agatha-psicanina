'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { DiagnosisPayload } from '@/hooks/useChatSession'

const TEXTS = {
  header:       'Diagnóstico Psicanino Oficial™',
  subHeader:    'Fictício · Para fins de entretenimento',
  drama:        'Nível de Drama',
  sintomas:     'Sintomas Identificados',
  prescription: 'Prescrição',
  finalWord:    'Palavra Final da Agatha',
  sharePrompt:  'Para copiar e mandar pro grupo',
  btnNew:       '🔄 Nova Consulta',
  btnResult:    '✨ Ver resultado completo',
  btnProntuario:'📚 Ver Prontuário',
  btnShare:     '📤 Compartilhar frase',
  btnCopied:    '✅ Copiado!',
  dramaLabels:  ['', 'Zen total', 'Zen total', 'Tranquilo', 'Tranquilo', 'Moderado', 'Moderado', 'Intenso', 'Intenso', 'Novela das 9', 'Novela das 9'],
}

function dramaLevel(level: number): { color: string; label: string } {
  if (level <= 2) return { color: '#27ae60', label: TEXTS.dramaLabels[level] }
  if (level <= 4) return { color: '#2ecc71', label: TEXTS.dramaLabels[level] }
  if (level <= 6) return { color: '#f39c12', label: TEXTS.dramaLabels[level] }
  if (level <= 8) return { color: '#e67e22', label: TEXTS.dramaLabels[level] }
  return { color: '#e74c3c', label: TEXTS.dramaLabels[level] }
}

interface DiagnosisCardProps {
  diagnosis: DiagnosisPayload
  onRestart: () => void
  shareToken?: string | null
}

export function DiagnosisCard({ diagnosis, onRestart, shareToken }: DiagnosisCardProps) {
  const drama = dramaLevel(diagnosis.nivelDrama)
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')

  function handleShare() {
    const text =
      `🐾 "${diagnosis.fraseCompartilhavel}"\n\n` +
      `Diagnóstico Psicanino por Agatha PsiCanina — entretenimento`

    if (navigator.share) {
      navigator.share({ text }).catch(() => copyToClipboard(text))
    } else {
      copyToClipboard(text)
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopyState('copied')
      setTimeout(() => setCopyState('idle'), 2500)
    })
  }

  return (
    <div
      className="mx-2 my-3 rounded-2xl overflow-hidden border border-white/15"
      style={{
        background: 'linear-gradient(145deg, rgba(74,144,217,0.12) 0%, rgba(155,89,182,0.14) 100%)',
        backdropFilter: 'blur(24px)',
        boxShadow: '0 0 48px rgba(74,144,217,0.18), 0 0 80px rgba(155,89,182,0.08)',
      }}
    >
      {/* ── Cabeçalho ───────────────────────────────────────────────── */}
      <div
        className="px-5 py-4 border-b border-white/10 flex items-center gap-3"
        style={{ background: 'rgba(255,255,255,0.04)' }}
      >
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0"
          style={{ background: 'linear-gradient(135deg,rgba(74,144,217,0.3),rgba(155,89,182,0.3))', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          🐾
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'var(--accent-blue)' }}>
            {TEXTS.header}
          </p>
          <p className="text-xs mt-0.5 italic truncate" style={{ color: 'var(--text-secondary)' }}>
            {TEXTS.subHeader}
          </p>
        </div>
      </div>

      <div className="px-5 py-5 space-y-5">
        {/* ── Diagnóstico principal ─────────────────────────────────── */}
        <div>
          <h2 className="text-xl font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
            {diagnosis.diagnostico}
          </h2>
          <p className="text-xs mt-1 font-medium" style={{ color: 'var(--accent-purple, #9b59b6)' }}>
            🐩 Arquétipo Canino: <span style={{ color: 'var(--text-primary)' }}>{diagnosis.arquetipoCanino}</span>
          </p>
        </div>

        {/* ── Nível de Drama ────────────────────────────────────────── */}
        <div
          className="rounded-xl px-4 py-3 border border-white/10"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: drama.color }}>
              🎭 {TEXTS.drama}
            </p>
            <span className="text-xs font-semibold" style={{ color: drama.color }}>
              {diagnosis.nivelDrama}/10 · {drama.label}
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${diagnosis.nivelDrama * 10}%`, background: drama.color }}
            />
          </div>
        </div>

        {/* ── Sintomas ─────────────────────────────────────────────── */}
        {diagnosis.sintomas.length > 0 && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--text-secondary)' }}>
              🩺 {TEXTS.sintomas}
            </p>
            <ul className="space-y-1.5">
              {diagnosis.sintomas.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                  <span className="shrink-0 mt-0.5 text-xs" style={{ color: 'var(--accent-blue)' }}>◆</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Prescrição ────────────────────────────────────────────── */}
        <div
          className="rounded-xl px-4 py-3 border"
          style={{ background: 'rgba(74,144,217,0.08)', borderColor: 'rgba(74,144,217,0.25)' }}
        >
          <p className="text-[11px] font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--accent-blue)' }}>
            💊 {TEXTS.prescription}
          </p>
          <p className="text-sm italic leading-relaxed" style={{ color: 'var(--text-primary)' }}>
            {diagnosis.prescricao}
          </p>
        </div>

        {/* ── Resumo Afetivo ────────────────────────────────────────── */}
        <div
          className="rounded-xl px-4 py-3 border"
          style={{ background: 'rgba(155,89,182,0.08)', borderColor: 'rgba(155,89,182,0.2)' }}
        >
          <p className="text-[11px] font-bold uppercase tracking-wide mb-1" style={{ color: '#c39bd3' }}>
            🤍 {TEXTS.finalWord}
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
            {diagnosis.resumoAfetivo}
          </p>
        </div>

        {/* ── Frase Compartilhável ──────────────────────────────────── */}
        <div
          className="rounded-xl px-4 py-3 border border-dashed border-white/20 cursor-pointer hover:border-white/40 transition-colors"
          style={{ background: 'rgba(255,255,255,0.03)' }}
          onClick={handleShare}
          title="Clique para compartilhar"
        >
          <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>
            💬 {TEXTS.sharePrompt}
          </p>
          <p className="text-sm font-medium leading-snug" style={{ color: 'var(--text-primary)' }}>
            "{diagnosis.fraseCompartilhavel}"
          </p>
        </div>
      </div>

      {/* ── Ações — hierarquia clara: 1º Nova Consulta, 2º Prontuário/Resultado, 3º Compartilhar ── */}
      <div className="px-5 pb-5 flex flex-col gap-2.5">

        {/* 1º — Primário: Nova Consulta */}
        <button
          onClick={onRestart}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', padding: '14px 20px',
            borderRadius: 16, border: 'none', cursor: 'pointer',
            fontSize: 15, fontWeight: 700, color: '#fff',
            background: 'linear-gradient(135deg, rgba(74,144,217,0.9) 0%, rgba(155,89,182,0.9) 100%)',
            boxShadow: '0 4px 20px rgba(74,144,217,0.25)',
            transition: 'all 0.18s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.12)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={(e) => { e.currentTarget.style.filter = ''; e.currentTarget.style.transform = '' }}
        >
          {TEXTS.btnNew}
        </button>

        {/* 2º — Secundário: Ver resultado completo ou Prontuário */}
        {shareToken ? (
          <Link
            href={`/diagnostico/${shareToken}`}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', padding: '13px 20px',
              borderRadius: 16,
              border: '1.5px solid rgba(74,144,217,0.5)',
              fontSize: 14, fontWeight: 600,
              color: 'rgba(74,144,217,0.95)',
              background: 'rgba(74,144,217,0.06)',
              textDecoration: 'none',
              transition: 'all 0.18s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(74,144,217,0.12)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(74,144,217,0.06)' }}
          >
            {TEXTS.btnResult}
          </Link>
        ) : (
          <Link
            href="/prontuario"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', padding: '13px 20px',
              borderRadius: 16,
              border: '1.5px solid rgba(155,89,182,0.5)',
              fontSize: 14, fontWeight: 600,
              color: 'rgba(195,155,211,0.95)',
              background: 'rgba(155,89,182,0.06)',
              textDecoration: 'none',
              transition: 'all 0.18s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(155,89,182,0.12)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(155,89,182,0.06)' }}
          >
            {TEXTS.btnProntuario}
          </Link>
        )}

        {/* 3º — Terciário: Compartilhar (com feedback visual, sem alert) */}
        <button
          onClick={handleShare}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', padding: '11px 20px',
            borderRadius: 14,
            border: '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer',
            fontSize: 13, fontWeight: 600,
            color: copyState === 'copied' ? '#27ae60' : 'rgba(240,240,255,0.5)',
            background: copyState === 'copied' ? 'rgba(39,174,96,0.08)' : 'rgba(255,255,255,0.03)',
            transition: 'all 0.18s ease',
          }}
        >
          <span style={{ fontSize: 15 }}>{copyState === 'copied' ? '✅' : '📤'}</span>
          {copyState === 'copied' ? TEXTS.btnCopied : TEXTS.btnShare}
        </button>
      </div>
    </div>
  )
}
