'use client'

import type { DiagnosisPayload } from '@/hooks/useChatSession'

interface DiagnosisCardProps {
  diagnosis: DiagnosisPayload
  onRestart: () => void
}

export function DiagnosisCard({ diagnosis, onRestart }: DiagnosisCardProps) {
  function handleShare() {
    const text = `🐾 Meu diagnóstico psicanino: "${diagnosis.titulo}"\n\n${diagnosis.descricao}\n\nPor Agatha PsiCanina — entretenimento`
    if (navigator.share) {
      navigator.share({ text })
    } else {
      navigator.clipboard.writeText(text)
      alert('Diagnóstico copiado para a área de transferência!')
    }
  }

  return (
    <div
      className="mx-4 my-3 rounded-2xl overflow-hidden border border-white/15"
      style={{
        background: 'linear-gradient(135deg, rgba(74,144,217,0.15) 0%, rgba(155,89,182,0.15) 100%)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 0 40px rgba(74,144,217,0.2)',
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 border-b border-white/10 flex items-center gap-3"
        style={{ background: 'rgba(255,255,255,0.04)' }}
      >
        <span className="text-2xl">🐾</span>
        <div>
          <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: 'var(--accent-blue)' }}>
            Diagnóstico Psicanino Oficial™
          </p>
          <p className="text-xs mt-0.5 italic" style={{ color: 'var(--text-secondary)' }}>
            Fictício · Para fins de entretenimento
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4 space-y-4">
        <h2 className="text-lg font-bold leading-snug" style={{ color: 'var(--text-primary)' }}>
          {diagnosis.titulo}
        </h2>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {diagnosis.descricao}
        </p>

        <div
          className="rounded-xl px-4 py-3 border border-white/10"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--accent-blue)' }}>
            Prescrição
          </p>
          <p className="text-sm italic" style={{ color: 'var(--text-primary)' }}>
            {diagnosis.prescricao}
          </p>
        </div>

        {diagnosis.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {diagnosis.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] px-2.5 py-1 rounded-full border"
                style={{
                  background: 'rgba(155,89,182,0.15)',
                  borderColor: 'rgba(155,89,182,0.3)',
                  color: '#c39bd3',
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-5 pb-5 flex gap-3">
        <button
          onClick={handleShare}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
          style={{ background: 'var(--accent-blue)' }}
        >
          📤 Compartilhar
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
  )
}
