import Image from 'next/image'
import Link from 'next/link'

interface Props {
  /** Tamanho do logo em px (largura). Padrão: 160 */
  width?: number
  /** Se false, não envolve em link para home */
  linkable?: boolean
  /** Exibe CRP-PET 0001 abaixo do logo */
  showCrp?: boolean
  /** Alinhamento do bloco */
  align?: 'left' | 'center'
}

/**
 * Única fonte de verdade para o logo Agatha PsiCanina.
 * Renderiza exclusivamente a partir de /public/logo-agatha.png.
 */
export function BrandLogo({
  width = 160,
  linkable = true,
  showCrp = true,
  align = 'left',
}: Props) {
  const height = Math.round(width * 0.42) // proporção aproximada do arquivo

  const inner = (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: align === 'center' ? 'center' : 'flex-start',
        gap: 4,
      }}
    >
      {/* Logo image com glow roxo suave */}
      <div
        style={{
          filter: 'drop-shadow(0 0 10px rgba(139,92,246,0.45)) drop-shadow(0 0 3px rgba(34,211,238,0.20))',
          lineHeight: 0,
        }}
      >
        <Image
          src="/logo-agatha.png"
          alt="Agatha PsiCanina"
          width={width}
          height={height}
          priority
          style={{ width, height: 'auto', display: 'block' }}
        />
      </div>

      {/* CRP-PET 0001 — legenda institucional */}
      {showCrp && (
        <span
          style={{
            fontSize: 8,
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'rgba(201,168,76,0.55)',
            paddingLeft: align === 'left' ? 2 : 0,
          }}
        >
          CRP-PET 0001
        </span>
      )}
    </div>
  )

  if (!linkable) return inner

  return (
    <Link href="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
      {inner}
    </Link>
  )
}
