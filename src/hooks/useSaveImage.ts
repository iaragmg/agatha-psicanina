'use client'

import { useState, useRef, type RefObject } from 'react'

type Status = 'idle' | 'capturing' | 'done' | 'error'

interface UseSaveImageReturn {
  cardRef: RefObject<HTMLDivElement | null>
  status: Status
  saveImage: (filename?: string) => Promise<void>
}

export function useSaveImage(): UseSaveImageReturn {
  const cardRef = useRef<HTMLDivElement | null>(null)
  const [status, setStatus] = useState<Status>('idle')

  async function saveImage(filename = 'diagnostico-agatha.png') {
    const el = cardRef.current
    if (!el) return

    setStatus('capturing')

    try {
      // Importação dinâmica — html2canvas é pesado e só roda no cliente
      const { default: html2canvas } = await import('html2canvas')

      // @types/html2canvas instalado é v0.5 (legado) — usa os tipos do pacote diretamente
      type H2COptions = Parameters<typeof html2canvas>[1]
      const opts: H2COptions = {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: el.scrollWidth,
        windowHeight: el.scrollHeight,
      } as H2COptions

      const canvas = await html2canvas(el, opts)

      // Converter para blob e disparar download
      canvas.toBlob((blob) => {
        if (!blob) {
          setStatus('error')
          return
        }

        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
        setStatus('done')

        // Volta ao estado idle após 2 s para o botão não ficar "travado"
        setTimeout(() => setStatus('idle'), 2000)
      }, 'image/png')
    } catch (err) {
      console.error('[useSaveImage]', err)
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return { cardRef, status, saveImage }
}
