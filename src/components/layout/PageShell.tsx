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
        {/* Logo: estilo image_825980 — script "Agatha" + sans "PsiCanina" + ícone cabeça/pata */}
        <Link
          href="/"
          style={{
            textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: 12,
          }}
        >
          {/* Bloco de texto: Agatha (cursiva) + PsiCanina (sans) + CRP-PET */}
          <div style={{ lineHeight: 1 }}>
            {/* "Agatha" em fonte script com glow roxo */}
            <div
              style={{
                fontFamily: "'Dancing Script', cursive",
                fontSize: 26, fontWeight: 700,
                background: 'linear-gradient(135deg, #c9b3f5 0%, #8b5cf6 55%, #a78bfa 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 8px rgba(139,92,246,0.55))',
                letterSpacing: '0.01em',
                lineHeight: 1,
              }}
            >
              Agatha
            </div>
            {/* "PsiCanina" em sans, levemente menor, ciano-lilás */}
            <div
              style={{
                fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)',
                fontSize: 11, fontWeight: 500, letterSpacing: '0.08em',
                background: 'linear-gradient(90deg, #22d3ee 0%, rgba(167,139,250,0.90) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginTop: 1,
              }}
            >
              PsiCanina
            </div>
            {/* CRP-PET 0001 em dourado sutil */}
            <div
              style={{
                fontSize: 8, fontWeight: 600, letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'rgba(201,168,76,0.55)',
                marginTop: 3,
              }}
            >
              CRP-PET 0001
            </div>
          </div>

          {/* Ícone: silhueta de cabeça com pata — inline SVG */}
          <div
            style={{
              filter: 'drop-shadow(0 0 10px rgba(139,92,246,0.50))',
              flexShrink: 0,
            }}
          >
            <svg
              width="46" height="46" viewBox="0 0 46 46" fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {/* Fundo circular sutil */}
              <circle
                cx="23" cy="23" r="21"
                fill="rgba(20,10,45,0.70)"
                stroke="rgba(139,92,246,0.40)"
                strokeWidth="1.2"
              />

              {/* Silhueta de cabeça humana estilizada */}
              <path
                d="M23 8 C16 8 11 13 11 20 C11 25 13 29 17 31 L17 35 L29 35 L29 31 C33 29 35 25 35 20 C35 13 30 8 23 8 Z"
                fill="none"
                stroke="rgba(167,139,250,0.55)"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />

              {/* Pata dentro da cabeça — almofada central */}
              <ellipse cx="23" cy="27" rx="5" ry="3.8"
                fill="rgba(139,92,246,0.80)"
              />
              {/* Dedo 1 */}
              <ellipse cx="17.5" cy="22" rx="2.2" ry="1.8"
                fill="rgba(139,92,246,0.80)"
              />
              {/* Dedo 2 */}
              <ellipse cx="21" cy="20.2" rx="2.2" ry="1.8"
                fill="rgba(139,92,246,0.80)"
              />
              {/* Dedo 3 */}
              <ellipse cx="25" cy="20.2" rx="2.2" ry="1.8"
                fill="rgba(139,92,246,0.80)"
              />
              {/* Dedo 4 */}
              <ellipse cx="28.5" cy="22" rx="2.2" ry="1.8"
                fill="rgba(139,92,246,0.80)"
              />
            </svg>
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
