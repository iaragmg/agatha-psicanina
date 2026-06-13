'use client'

import { useRef, useState } from 'react'
import { DiagnosisResult } from '@/components/diagnosis/DiagnosisResult'
import { useSaveImage } from '@/hooks/useSaveImage'
import type { DiagnosisPayload } from '@/hooks/useChatSession'

interface Props {
  diagnosis: DiagnosisPayload
  shareToken: string
}

export function DiagnosisPageClient({ diagnosis, shareToken }: Props) {
  const { cardRef, status, saveImage } = useSaveImage()
  const [copied, setCopied] = useState(false)

  function handleShare() {
    const url = `${window.location.origin}/diagnostico/${shareToken}`
    const text =
      `🐾 "${diagnosis.fraseCompartilhavel}"\n\n` +
      `Diagnóstico Psicanino por Agatha PsiCanina:\n${url}`

    if (navigator.share) {
      navigator.share({ title: diagnosis.diagnostico, text, url }).catch(() => fallbackCopy(text))
    } else {
      fallbackCopy(text)
    }
  }

  function fallbackCopy(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  const saveLabel =
    status === 'capturing' ? '⏳ Capturando...' :
    status === 'done' ? '✅ Salvo!' :
    status === 'error' ? '❌ Erro' :
    '📸 Salvar como imagem'

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px 48px',
        gap: 28,
      }}
    >
      {/* Título da página */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(74,144,217,0.8)', marginBottom: 8 }}>
          🐾 Resultado Psicanino
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f0f0ff', margin: 0 }}>
          {diagnosis.diagnostico}
        </h1>
      </div>

      {/* Card capturável */}
      <DiagnosisResult ref={cardRef} diagnosis={diagnosis} shareToken={shareToken} />

      {/* Botões de ação */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 520 }}>
        <button
          onClick={handleShare}
          style={{
            width: '100%',
            padding: '14px 20px',
            borderRadius: 14,
            border: 'none',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 700,
            color: '#fff',
            background: 'linear-gradient(135deg, rgba(74,144,217,0.9), rgba(155,89,182,0.9))',
            transition: 'opacity 0.2s',
          }}
        >
          {copied ? '✅ Copiado!' : '📤 Compartilhar diagnóstico'}
        </button>

        <button
          onClick={() => saveImage('diagnostico-agatha.png')}
          disabled={status === 'capturing'}
          style={{
            width: '100%',
            padding: '14px 20px',
            borderRadius: 14,
            border: '1px solid rgba(255,255,255,0.12)',
            cursor: status === 'capturing' ? 'not-allowed' : 'pointer',
            fontSize: 14,
            fontWeight: 600,
            color: status === 'done' ? '#27ae60' : status === 'error' ? '#e74c3c' : '#f0f0ff',
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(12px)',
            transition: 'all 0.2s',
            opacity: status === 'capturing' ? 0.6 : 1,
          }}
        >
          {saveLabel}
        </button>

        <a
          href="/chat"
          style={{
            display: 'block',
            textAlign: 'center',
            padding: '12px',
            borderRadius: 14,
            fontSize: 13,
            color: 'rgba(240,240,255,0.5)',
            textDecoration: 'none',
          }}
        >
          🔄 Nova consulta com a Agatha
        </a>
      </div>
    </div>
  )
}
