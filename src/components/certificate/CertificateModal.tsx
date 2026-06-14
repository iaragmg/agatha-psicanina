'use client'

import { useState, useRef, useCallback } from 'react'
import { CertificateCard, type CertificateData } from './CertificateCard'
import type { DiagnosisPayload } from '@/hooks/useChatSession'
import { RARITY_META, type Rarity } from '@/lib/certificate-indicators'

interface Props {
  diagnosis: DiagnosisPayload
  shareToken: string
  onClose: () => void
  /** Quando fornecido, pula a fase de nome e exibe o certificado diretamente */
  initialCertificateData?: CertificateData
}

type Phase = 'name-input' | 'loading' | 'certificate'
type CopyState = 'idle' | 'copied'
type SaveState = 'idle' | 'capturing' | 'done' | 'error'

function buildShareText(data: CertificateData, url: string): string {
  const rm = RARITY_META[data.rarity] ?? RARITY_META.COMUM
  const rarityStars = '⭐'.repeat(rm.stars)

  return (
    `🏅 *CERTIFICADO OFICIAL PSI-CANINO* 🐾\n\n` +
    `Paciente: *${data.patientName}*\n` +
    `Arquétipo: ${data.diagnosis.arquetipoCanino}\n` +
    `Raridade: ${rarityStars} ${rm.label}\n\n` +
    `🥐 Compatibilidade com pão de queijo: ${data.compatibilidadePaoQueijo}%\n` +
    `📚 Chance de estudar até tarde: ${data.chanceEstudarMadrugada}%\n` +
    `🐶 Risco de adotar outro cachorro: ${data.riscoAdotarOutroCachorro}%\n\n` +
    `💬 _"${data.diagnosis.fraseCompartilhavel}"_\n\n` +
    `📋 Prontuário: #${data.certificateNumber}\n` +
    `📅 ${new Date(data.createdAt).toLocaleDateString('pt-BR')}\n\n` +
    `Ver diagnóstico completo: ${url}\n\n` +
    `_Emitido pela Dra. Agatha PsiCanina — Validade emocional indeterminada 🐾_`
  )
}

export function CertificateModal({ diagnosis, shareToken, onClose, initialCertificateData }: Props) {
  const [phase, setPhase] = useState<Phase>(initialCertificateData ? 'certificate' : 'name-input')
  const [name, setName] = useState('')
  const [certData, setCertData] = useState<CertificateData | null>(initialCertificateData ?? null)
  const [error, setError] = useState<string | null>(null)
  const [copyState, setCopyState] = useState<CopyState>('idle')
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const cardRef = useRef<HTMLDivElement | null>(null)

  const pageUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/diagnostico/${shareToken}`
      : `/diagnostico/${shareToken}`

  async function handleGenerate() {
    const trimmed = name.trim() || 'Paciente Anônimo'
    setPhase('loading')
    setError(null)

    try {
      const res = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shareToken, patientName: trimmed }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Erro ao gerar certificado.')
      }

      const data = await res.json()
      setCertData({
        diagnosis,
        patientName: data.patientName,
        certificateNumber: data.certificateNumber,
        createdAt: data.createdAt,
        rarity: (data.rarity ?? 'COMUM') as Rarity,
        compatibilidadePaoQueijo: data.compatibilidadePaoQueijo ?? 70,
        chanceEstudarMadrugada:   data.chanceEstudarMadrugada   ?? 50,
        riscoAdotarOutroCachorro: data.riscoAdotarOutroCachorro  ?? 30,
      })
      setPhase('certificate')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido.')
      setPhase('name-input')
    }
  }

  const handleCopy = useCallback(() => {
    if (!certData) return
    const text = buildShareText(certData, pageUrl)
    navigator.clipboard.writeText(text).then(() => {
      setCopyState('copied')
      setTimeout(() => setCopyState('idle'), 2500)
    })
  }, [certData, pageUrl])

  const handleWhatsApp = useCallback(() => {
    if (!certData) return
    const text = buildShareText(certData, pageUrl)
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
  }, [certData, pageUrl])

  const handleSaveImage = useCallback(async () => {
    const el = cardRef.current
    if (!el) return
    setSaveState('capturing')
    try {
      const { default: html2canvas } = await import('html2canvas')
      type H2COptions = Parameters<typeof html2canvas>[1]
      const canvas = await html2canvas(el, {
        backgroundColor: '#0d0b1e',
        scale: 2,
        useCORS: true,
        logging: false,
      } as H2COptions)
      canvas.toBlob((blob) => {
        if (!blob) { setSaveState('error'); return }
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `certificado-agatha-${certData?.certificateNumber ?? 'psicanino'}.png`
        a.click()
        URL.revokeObjectURL(url)
        setSaveState('done')
        setTimeout(() => setSaveState('idle'), 2000)
      }, 'image/png')
    } catch {
      setSaveState('error')
      setTimeout(() => setSaveState('idle'), 3000)
    }
  }, [certData])

  const handleDownloadPDF = useCallback(() => {
    const el = cardRef.current
    if (!el) return
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`<!DOCTYPE html><html><head>
      <title>Certificado ${certData?.certificateNumber ?? ''}</title>
      <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{background:#0d0b1e;display:flex;justify-content:center;padding:32px}
        @media print{body{padding:0}@page{margin:0}}
        @media print{*{-webkit-print-color-adjust:exact!important;color-adjust:exact!important}}
      </style></head><body>
      ${el.outerHTML}
      <script>window.onload=function(){window.print();window.close()}<\/script>
    </body></html>`)
    win.document.close()
  }, [certData])

  return (
    <>
      <style>{`
        @keyframes modal-in { from{opacity:0;transform:scale(0.96) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
        .cert-modal { animation: modal-in .25s ease both }
        .cert-btn:hover { filter: brightness(1.1); transform: translateY(-1px) }
      `}</style>

      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 50,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 16, overflowY: 'auto',
        }}
      >
        <div
          className="cert-modal"
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: 580,
            background: 'linear-gradient(160deg, #0d0b1e 0%, #140e2b 100%)',
            border: '1px solid rgba(201,168,76,0.25)',
            borderRadius: 20,
            overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
          }}
        >
          {/* Header do modal */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid rgba(201,168,76,0.15)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>🏅</span>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#e8c776', margin: 0, letterSpacing: '0.06em' }}>
                  Certificado Oficial PsiCanino
                </p>
                <p style={{ fontSize: 11, color: 'rgba(245,240,224,0.4)', margin: 0 }}>
                  CRP — Conselho Regional dos Pets
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8, width: 32, height: 32, cursor: 'pointer',
                color: 'rgba(245,240,224,0.6)', fontSize: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >×</button>
          </div>

          {/* Fase: entrada do nome */}
          {phase === 'name-input' && (
            <div style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 42, marginBottom: 12 }}>📜</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#e8c776', margin: '0 0 8px', fontFamily: 'Georgia, serif' }}>
                  Como você quer aparecer no certificado?
                </h3>
                <p style={{ fontSize: 13, color: 'rgba(245,240,224,0.5)', margin: 0 }}>
                  Pode ser seu nome, apelido ou título secreto.
                </p>
              </div>

              <div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                  placeholder="Ex: Ana Carolina, Rainha do Drama..."
                  maxLength={120}
                  autoFocus
                  style={{
                    width: '100%', padding: '14px 16px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1.5px solid rgba(201,168,76,0.3)',
                    borderRadius: 12, color: '#f5f0e0',
                    fontSize: 15, outline: 'none',
                    fontFamily: 'system-ui, sans-serif',
                    boxSizing: 'border-box',
                  }}
                />
                {error && (
                  <p style={{ fontSize: 12, color: '#e74c3c', marginTop: 8 }}>⚠️ {error}</p>
                )}
              </div>

              <button
                className="cert-btn"
                onClick={handleGenerate}
                style={{
                  padding: '14px',
                  borderRadius: 14, border: 'none', cursor: 'pointer',
                  fontSize: 15, fontWeight: 700, color: '#0d0b1e',
                  background: 'linear-gradient(135deg, #e8c776 0%, #c9a84c 100%)',
                  boxShadow: '0 4px 24px rgba(201,168,76,0.3)',
                  transition: 'all 0.18s ease',
                }}
              >
                📜 Gerar meu certificado
              </button>
            </div>
          )}

          {/* Fase: loading */}
          {phase === 'loading' && (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16, animation: 'spin 1s linear infinite' }}>⏳</div>
              <p style={{ color: 'rgba(245,240,224,0.6)', fontSize: 14 }}>
                Preparando seu certificado oficial...
              </p>
            </div>
          )}

          {/* Fase: certificado */}
          {phase === 'certificate' && certData && (
            <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
              {/* O card capturável */}
              <CertificateCard ref={cardRef} {...certData} />

              {/* Botões de ação */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 540 }}>
                {/* WhatsApp */}
                <button
                  className="cert-btn"
                  onClick={handleWhatsApp}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '13px', borderRadius: 14, border: 'none', cursor: 'pointer',
                    fontSize: 14, fontWeight: 700, color: '#fff',
                    background: 'linear-gradient(135deg, #25D366, #128C7E)',
                    boxShadow: '0 4px 20px rgba(37,211,102,0.2)',
                    transition: 'all 0.18s ease',
                  }}
                >
                  <span style={{ fontSize: 18 }}>💬</span> Compartilhar no WhatsApp
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {/* Copiar */}
                  <button
                    className="cert-btn"
                    onClick={handleCopy}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      padding: '12px', borderRadius: 14,
                      border: '1px solid rgba(201,168,76,0.3)',
                      cursor: 'pointer', fontSize: 13, fontWeight: 600,
                      color: copyState === 'copied' ? '#27ae60' : '#e8c776',
                      background: copyState === 'copied' ? 'rgba(39,174,96,0.08)' : 'rgba(201,168,76,0.06)',
                      transition: 'all 0.18s ease',
                    }}
                  >
                    <span>{copyState === 'copied' ? '✅' : '📋'}</span>
                    {copyState === 'copied' ? 'Copiado!' : 'Copiar'}
                  </button>

                  {/* Salvar imagem */}
                  <button
                    className="cert-btn"
                    onClick={handleSaveImage}
                    disabled={saveState === 'capturing'}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      padding: '12px', borderRadius: 14,
                      border: '1px solid rgba(255,255,255,0.12)',
                      cursor: saveState === 'capturing' ? 'not-allowed' : 'pointer',
                      fontSize: 13, fontWeight: 600,
                      color: saveState === 'done' ? '#27ae60' : 'rgba(245,240,224,0.7)',
                      background: 'rgba(255,255,255,0.04)',
                      transition: 'all 0.18s ease',
                      opacity: saveState === 'capturing' ? 0.6 : 1,
                    }}
                  >
                    <span>{saveState === 'done' ? '✅' : '🖼️'}</span>
                    {saveState === 'capturing' ? 'Salvando...' : saveState === 'done' ? 'Salvo!' : 'Salvar'}
                  </button>
                </div>

                {/* PDF */}
                <button
                  className="cert-btn"
                  onClick={handleDownloadPDF}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '12px', borderRadius: 14,
                    border: '1px solid rgba(255,255,255,0.08)',
                    cursor: 'pointer', fontSize: 13, fontWeight: 600,
                    color: 'rgba(245,240,224,0.55)',
                    background: 'transparent',
                    transition: 'all 0.18s ease',
                  }}
                >
                  <span>📥</span> Baixar PDF (imprimir)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
