import Link from 'next/link'
import type React from 'react'

interface Props {
  children: React.ReactNode
  backHref?: string
  backLabel?: string
  maxWidth?: number
}

/**
 * Layout compartilhado para Ranking, Prontuário e Certificado.
 * Não define background próprio — deixa as esferas do body (globals.css) aparecerem.
 * Inclui o branding header com logo topo-esquerdo, fiel à referência visual.
 */
export function PageShell({
  children,
  backHref = '/',
  backLabel = '← Voltar para a clínica',
  maxWidth = 760,
}: Props) {
  return (
    <div
      className="page-root"
      style={{ padding: '0 16px 80px' }}
    >
      {/* ── Header de branding — topo esquerdo, estilo AmeiSiteAgatha ── */}
      <header
        style={{
          maxWidth,
          margin: '0 auto',
          padding: '20px 8px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 44,
        }}
      >
        {/* Logo: pata + nome em gradiente ciano → lilás (replica referência) */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Medallion */}
          <div
            style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'radial-gradient(circle at 38% 35%, rgba(0,210,235,0.30) 0%, rgba(110,40,190,0.20) 100%)',
              border: '1.5px solid rgba(0,188,212,0.40)',
              boxShadow: '0 0 16px rgba(0,188,212,0.20)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, flexShrink: 0,
            }}
          >
            🐾
          </div>

          {/* Nome */}
          <div>
            <div
              style={{
                fontSize: 17, fontWeight: 800, letterSpacing: '-0.01em',
                background: 'linear-gradient(90deg, #22d3ee 0%, rgba(195,155,211,0.95) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: 1.1,
              }}
            >
              Agatha PsiCanina
            </div>
            <div
              style={{
                fontSize: 9, fontWeight: 600, letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'rgba(201,168,76,0.60)',
                marginTop: 1,
              }}
            >
              CRP-PET 0001
            </div>
          </div>
        </Link>

        {/* Link de voltar — topo direito */}
        <Link
          href={backHref}
          style={{
            fontSize: 12,
            color: 'rgba(34,211,238,0.55)',
            textDecoration: 'none',
            letterSpacing: '0.02em',
          }}
        >
          {backLabel}
        </Link>
      </header>

      {/* Conteúdo da página */}
      <div style={{ maxWidth, margin: '0 auto' }}>
        {children}
      </div>
    </div>
  )
}
