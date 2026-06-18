import Link from 'next/link'
import type React from 'react'
import { BrandLogo } from './BrandLogo'

interface Props {
  children: React.ReactNode
  backHref?: string
  backLabel?: string
  maxWidth?: number
}

/**
 * Layout compartilhado para Ranking, Prontuário, Certificado.
 * Não define background próprio — deixa as esferas do body (globals.css) aparecerem.
 * BrandLogo é a única fonte de verdade para o cabeçalho.
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
      {/* ── Header de branding ── */}
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
        <BrandLogo width={148} showCrp align="left" />

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
