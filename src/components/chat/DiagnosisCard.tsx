'use client'

import Link from 'next/link'
import type { DiagnosisPayload } from '@/hooks/useChatSession'

interface DiagnosisCardProps {
  diagnosis: DiagnosisPayload
  onRestart: () => void
  shareToken?: string | null
}

// Mapeia nivelDrama (1–10) para cor e rótulo
function dramaLevel(level: number): { color: string; label: string } {
  if (level <= 2) return { color: '#27ae60', label: 'Zen total' }
  if (level <= 4) return { color: '#2ecc71', label: 'Tranquilo' }
  if (level <= 6) return { color: '#f39c12', label: 'Moderado' }
  if (level <= 8) return { color: '#e67e22', label: 'Intenso' }
  return { color: '#e74c3c', label: 'Novela das 9' }
}

export function DiagnosisCard({ diagnosis, onRestart, shareToken }: DiagnosisCardProps) {
  const drama = dramaLevel(diagnosis.nivelDrama)

  function handleShare() {
    const text =
      `🐾 "${diagnosis.fraseCompartilhavel}"\n\n` +
      `Diagnóstico Psicanino por Agatha PsiCanina — entretenimento`

    if (navigator.share) {
      navigator.share({ text }).catch(() => fallbackCopy(text))
    } else {
      fallbackCopy(text)
    }
  }

  function fallbackCopy(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      alert('Frase copiada! Cole onde quiser. 🐾')
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
            Diagnóstico Psicanino Oficial™
          </p>
          <p className="text-xs mt-0.5 italic truncate" style={{ color: 'var(--text-secondary)' }}>
            Fictício · Para fins de entretenimento
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
              🎭 Nível de Drama
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
              🩺 Sintomas Identificados
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
            💊 Prescrição
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
            🤍 Palavra Final da Agatha
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
            💬 Para copiar e mandar pro grupo
          </p>
          <p className="text-sm font-medium leading-snug" style={{ color: 'var(--text-primary)' }}>
            "{diagnosis.fraseCompartilhavel}"
          </p>
        </div>

      </div>

      {/* ── Ações ────────────────────────────────────────────────────── */}
      <div className="px-5 pb-5 flex flex-col gap-2">
        {shareToken && (
          <Link
            href={`/diagnostico/${shareToken}`}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white text-center transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg, rgba(74,144,217,0.8), rgba(155,89,182,0.8))' }}
          >
            ✨ Ver resultado completo
          </Link>
        )}
        <div className="flex gap-3">
          <button
            onClick={handleShare}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'var(--accent-blue)' }}
          >
            📤 Compartilhar frase
          </button>
          <button
            onClick={onRestart}
            className="py-2.5 px-4 rounded-xl text-sm font-medium transition-all hover:opacity-80 border border-white/10"
            style={{ color: 'var(--text-secondary)' }}
          >
            🔄 Nova consulta
          </button>
        </div>
      </div>
    </div>
  )
}
