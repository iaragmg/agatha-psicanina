'use client'

import { useState } from 'react'
import { DiagnosisResult } from '@/components/diagnosis/DiagnosisResult'
import { CertificateModal } from '@/components/certificate/CertificateModal'
import { RarityBadge } from '@/components/ranking/RarityBadge'
import { useSaveImage } from '@/hooks/useSaveImage'
import type { DiagnosisPayload } from '@/hooks/useChatSession'
import type { RarityResult } from '@/lib/ranking-analytics'

interface Props {
  diagnosis: DiagnosisPayload
  shareToken: string
  rarityData: RarityResult
}

function buildShareText(diagnosis: DiagnosisPayload, url: string): string {
  const dramaSuffix =
    diagnosis.nivelDrama <= 3 ? 'zen 🌿' :
    diagnosis.nivelDrama <= 6 ? 'moderado 🌊' :
    diagnosis.nivelDrama <= 8 ? 'intenso 🔥' : 'novela das 9 🎭'

  return (
    `🐾 *Meu Diagnóstico Psicanino*\n\n` +
    `📋 *${diagnosis.diagnostico}*\n` +
    `🐩 Arquétipo: ${diagnosis.arquetipoCanino}\n` +
    `🎭 Nível de drama: ${diagnosis.nivelDrama}/10 — ${dramaSuffix}\n\n` +
    `💬 _"${diagnosis.fraseCompartilhavel}"_\n\n` +
    `Ver diagnóstico completo:\n${url}\n\n` +
    `_by Agatha PsiCanina 🐶 (entretenimento, não psicologia real)_`
  )
}

export function DiagnosisPageClient({ diagnosis, shareToken, rarityData }: Props) {
  const { cardRef, status: saveStatus, saveImage } = useSaveImage()
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')
  const [wpState, setWpState] = useState<'idle' | 'sent'>('idle')
  const [showCertModal, setShowCertModal] = useState(false)

  const pageUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/diagnostico/${shareToken}`
      : `/diagnostico/${shareToken}`

  function handleCopy() {
    const text = buildShareText(diagnosis, pageUrl)
    navigator.clipboard.writeText(text).then(() => {
      setCopyState('copied')
      setTimeout(() => setCopyState('idle'), 2500)
    })
  }

  function handleWhatsApp() {
    const text = buildShareText(diagnosis, pageUrl)
    const encoded = encodeURIComponent(text)
    window.open(`https://wa.me/?text=${encoded}`, '_blank', 'noopener,noreferrer')
    setWpState('sent')
    setTimeout(() => setWpState('idle'), 3000)
  }

  const saveLabel =
    saveStatus === 'capturing' ? '⏳ Capturando...' :
    saveStatus === 'done'      ? '✅ Salvo!'        :
    saveStatus === 'error'     ? '❌ Erro'          :
    '📸 Salvar como imagem'

  return (
    <>
      {/* ── Fundo animado ───────────────────────────────────────────── */}
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes pulse-glow { 0%,100%{opacity:.5} 50%{opacity:1} }
        @keyframes fade-in { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .diagnosis-page { animation: fade-in .5s ease both }
        .btn-primary:hover { filter: brightness(1.12); transform: translateY(-1px) }
        .btn-secondary:hover { background: rgba(255,255,255,0.08) !important; transform: translateY(-1px) }
        .btn-ghost:hover { color: rgba(240,240,255,0.8) !important }
      `}</style>

      <div
        className="diagnosis-page"
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '28px 16px 56px',
          gap: 0,
        }}
      >
        {/* ── Branding ──────────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 999,
            padding: '6px 16px',
            marginBottom: 20,
          }}>
            <span style={{ fontSize: 16 }}>🐾</span>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(74,144,217,0.9)' }}>
              Agatha PsiCanina
            </span>
          </div>

          <div style={{ animation: 'float 3.5s ease-in-out infinite', marginBottom: 12, fontSize: 56, lineHeight: 1 }}>
            🐶
          </div>

          <h1 style={{
            fontSize: 'clamp(20px, 5vw, 28px)',
            fontWeight: 800,
            color: '#f0f0ff',
            margin: '0 0 8px',
            lineHeight: 1.25,
            maxWidth: 480,
          }}>
            {diagnosis.diagnostico}
          </h1>

          <p style={{
            fontSize: 14,
            color: 'rgba(195,155,211,0.9)',
            margin: 0,
          }}>
            🐩 {diagnosis.arquetipoCanino}
          </p>
        </div>

        {/* ── Card capturável ───────────────────────────────────────── */}
        <DiagnosisResult ref={cardRef} diagnosis={diagnosis} shareToken={shareToken} />

        {/* ── Raridade relativa ─────────────────────────────────── */}
        <RarityBadge
          rarityData={rarityData}
          shareToken={shareToken}
          arquetipoCanino={diagnosis.arquetipoCanino}
        />

        {/* ── Botões — hierarquia: 1º Nova Consulta, 2º Prontuário, 3º Compartilhar ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 520 }}>

          {/* 1º — Primário: Nova Consulta */}
          <a
            className="btn-primary"
            href="/chat"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              width: '100%', padding: '15px 20px',
              borderRadius: 16, border: 'none', cursor: 'pointer',
              fontSize: 15, fontWeight: 700, color: '#fff',
              background: 'linear-gradient(135deg, rgba(74,144,217,0.9) 0%, rgba(155,89,182,0.9) 100%)',
              boxShadow: '0 4px 24px rgba(74,144,217,0.22)',
              textDecoration: 'none',
              transition: 'all 0.18s ease',
            }}
          >
            <span style={{ fontSize: 20 }}>🔄</span>
            Nova Consulta com a Agatha
          </a>

          {/* 2º — Secundário: Prontuário */}
          <a
            className="btn-secondary"
            href="/prontuario"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              width: '100%', padding: '14px 20px',
              borderRadius: 16,
              border: '1.5px solid rgba(155,89,182,0.5)',
              cursor: 'pointer',
              fontSize: 14, fontWeight: 600,
              color: 'rgba(195,155,211,0.95)',
              background: 'rgba(155,89,182,0.07)',
              textDecoration: 'none',
              transition: 'all 0.18s ease',
            }}
          >
            <span style={{ fontSize: 18 }}>📚</span>
            Meu Prontuário PsiCanino
          </a>

          {/* 3º — Terciário: Ranking */}
          <a
            href="/ranking"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', padding: '12px 20px',
              borderRadius: 14,
              border: '1px solid rgba(201,168,76,0.2)',
              fontSize: 13, fontWeight: 600,
              color: 'rgba(201,168,76,0.7)',
              background: 'transparent',
              textDecoration: 'none',
            }}
          >
            <span>🏆</span>
            Ver ranking da clínica
          </a>

          {/* Separador: Compartilhe */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            margin: '6px 0 2px',
          }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            <span style={{ fontSize: 11, color: 'rgba(240,240,255,0.3)', whiteSpace: 'nowrap', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Compartilhe com o mundo
            </span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          </div>

          {/* 3º — Terciárias agrupadas: WhatsApp */}
          <button
            className="btn-secondary"
            onClick={handleWhatsApp}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              width: '100%', padding: '13px 20px',
              borderRadius: 14,
              border: '1px solid rgba(37,211,102,0.3)',
              cursor: 'pointer',
              fontSize: 14, fontWeight: 600, color: '#25D366',
              background: 'rgba(37,211,102,0.07)',
              transition: 'all 0.18s ease',
            }}
          >
            <span style={{ fontSize: 18 }}>💬</span>
            {wpState === 'sent' ? 'Abrindo WhatsApp...' : 'Compartilhar no WhatsApp'}
          </button>

          {/* Copiar texto */}
          <button
            className="btn-secondary"
            onClick={handleCopy}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              width: '100%', padding: '13px 20px',
              borderRadius: 14,
              border: `1px solid ${copyState === 'copied' ? 'rgba(39,174,96,0.4)' : 'rgba(255,255,255,0.12)'}`,
              cursor: 'pointer',
              fontSize: 14, fontWeight: 600,
              color: copyState === 'copied' ? '#27ae60' : 'rgba(240,240,255,0.7)',
              background: copyState === 'copied' ? 'rgba(39,174,96,0.08)' : 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(12px)',
              transition: 'all 0.18s ease',
            }}
          >
            <span style={{ fontSize: 16 }}>{copyState === 'copied' ? '✅' : '📋'}</span>
            {copyState === 'copied' ? 'Copiado! Vai mandar no grupo?' : 'Copiar diagnóstico'}
          </button>

          {/* Salvar imagem */}
          <button
            className="btn-secondary"
            onClick={() => saveImage('diagnostico-agatha.png')}
            disabled={saveStatus === 'capturing'}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              width: '100%', padding: '13px 20px',
              borderRadius: 14,
              border: `1px solid ${saveStatus === 'done' ? 'rgba(39,174,96,0.4)' : saveStatus === 'error' ? 'rgba(231,76,60,0.4)' : 'rgba(255,255,255,0.12)'}`,
              cursor: saveStatus === 'capturing' ? 'not-allowed' : 'pointer',
              fontSize: 14, fontWeight: 600,
              color: saveStatus === 'done' ? '#27ae60' : saveStatus === 'error' ? '#e74c3c' : 'rgba(240,240,255,0.7)',
              background: saveStatus === 'done' ? 'rgba(39,174,96,0.08)' : 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(12px)',
              transition: 'all 0.18s ease',
              opacity: saveStatus === 'capturing' ? 0.6 : 1,
            }}
          >
            <span style={{ fontSize: 16 }}>
              {saveStatus === 'capturing' ? '⏳' : saveStatus === 'done' ? '✅' : saveStatus === 'error' ? '❌' : '📸'}
            </span>
            {saveLabel}
          </button>

          {/* Separador + Certificado */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            margin: '4px 0',
          }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
            <span style={{ fontSize: 11, color: 'rgba(240,240,255,0.25)', letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              ou
            </span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
          </div>

          <button
            className="btn-primary"
            onClick={() => setShowCertModal(true)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              width: '100%', padding: '15px 20px',
              borderRadius: 16, border: 'none', cursor: 'pointer',
              fontSize: 15, fontWeight: 700, color: '#0d0b1e',
              background: 'linear-gradient(135deg, #e8c776 0%, #c9a84c 100%)',
              boxShadow: '0 4px 24px rgba(201,168,76,0.25)',
              transition: 'all 0.18s ease',
            }}
          >
            <span style={{ fontSize: 20 }}>📜</span>
            Gerar Certificado Oficial
          </button>
        </div>

        {/* ── Rodapé ────────────────────────────────────────────────── */}
        <p style={{
          marginTop: 36,
          fontSize: 11,
          color: 'rgba(240,240,255,0.2)',
          textAlign: 'center',
          lineHeight: 1.6,
        }}>
          🐾 Agatha PsiCanina é entretenimento.<br />
          Não substitui psicologia ou veterinária de verdade.
        </p>
      </div>

      {/* Modal do certificado */}
      {showCertModal && (
        <CertificateModal
          diagnosis={diagnosis}
          shareToken={shareToken}
          onClose={() => setShowCertModal(false)}
        />
      )}
    </>
  )
}
