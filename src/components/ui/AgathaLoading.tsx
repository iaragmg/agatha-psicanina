'use client'

import { useState, useEffect } from 'react'

// ─── Frases temáticas da Dra. Agatha ─────────────────────────────────────────

const PHRASES = [
  { emoji: '🐾', text: 'Farejando seu inconsciente...' },
  { emoji: '🧠', text: 'Organizando seus pensamentos (e bagunças)...' },
  { emoji: '🔍', text: 'Investigando seus traumas (com carinho)...' },
  { emoji: '🐕', text: 'Checando suas memórias felpudas...' },
  { emoji: '📚', text: 'Consultando meus livros & meu faro clínico...' },
  { emoji: '🧩', text: 'Montando o quebra-cabeça da sua mente...' },
  { emoji: '📡', text: 'Sintonizando sua frequência emocional...' },
  { emoji: '✨', text: 'Analisando seus padrões (e exceções)...' },
  { emoji: '🦴', text: 'Desenterrando verdades (sem julgamentos)...' },
  { emoji: '🏆', text: 'Preparando seu diagnóstico épico...' },
] as const

const SUBTITLE = 'Isso pode levar alguns instantes'

// Intervalo aleatório entre 2800 ms e 3500 ms para parecer natural
function nextDelay() {
  return 2800 + Math.random() * 700
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AgathaLoading() {
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>

    const cycle = () => {
      // 1. fade out (350 ms)
      setVisible(false)
      timeout = setTimeout(() => {
        // 2. troca frase + fade in
        setPhraseIdx((i) => (i + 1) % PHRASES.length)
        setVisible(true)
        // 3. agenda próximo ciclo
        timeout = setTimeout(cycle, nextDelay())
      }, 350)
    }

    timeout = setTimeout(cycle, nextDelay())
    return () => clearTimeout(timeout)
  }, [])

  const { emoji, text } = PHRASES[phraseIdx]

  return (
    <>
      <style>{`
        @keyframes agatha-float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
        @keyframes agatha-paw-pop {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50%       { opacity: 0.65; transform: scale(1.15); }
        }
        .agatha-float   { animation: agatha-float 2.8s ease-in-out infinite; }
        .agatha-paw-1   { animation: agatha-paw-pop 2.1s ease-in-out 0.0s infinite; }
        .agatha-paw-2   { animation: agatha-paw-pop 2.1s ease-in-out 0.4s infinite; }
        .agatha-paw-3   { animation: agatha-paw-pop 2.1s ease-in-out 0.8s infinite; }
      `}</style>

      <div
        style={{
          width: '100%',
          padding: '28px 20px 24px',
          borderRadius: 20,
          background: 'linear-gradient(145deg, rgba(19,13,38,0.92) 0%, rgba(26,14,50,0.92) 100%)',
          border: '1px solid rgba(155,89,182,0.25)',
          boxShadow: '0 0 40px rgba(155,89,182,0.12), 0 4px 24px rgba(0,0,0,0.3)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow de fundo */}
        <div style={{
          position: 'absolute', top: -50, left: '50%', transform: 'translateX(-50%)',
          width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(155,89,182,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Avatar animado */}
        <div className="agatha-float" style={{ marginBottom: 18 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(74,144,217,0.25) 0%, rgba(155,89,182,0.25) 100%)',
            border: '2px solid rgba(155,89,182,0.4)',
            boxShadow: '0 0 24px rgba(155,89,182,0.3)',
            fontSize: 36,
          }}>
            🐾
          </div>
        </div>

        {/* Frase dinâmica com fade */}
        <div
          aria-live="polite"
          aria-atomic="true"
          style={{
            minHeight: 52,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 6,
            marginBottom: 16,
            transition: 'opacity 0.35s ease',
            opacity: visible ? 1 : 0,
          }}
        >
          <div style={{ fontSize: 22, lineHeight: 1 }}>{emoji}</div>
          <p style={{
            margin: 0,
            fontSize: 15, fontWeight: 600,
            color: 'rgba(195,155,211,0.95)',
            letterSpacing: '0.01em',
          }}>
            {text}
          </p>
        </div>

        {/* Subtítulo fixo */}
        <p style={{
          margin: '0 0 18px',
          fontSize: 12,
          color: 'rgba(240,240,255,0.3)',
          letterSpacing: '0.03em',
        }}>
          {SUBTITLE}
        </p>

        {/* Patinhas decorativas */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
          <span className="agatha-paw-1" style={{ fontSize: 16 }}>🐾</span>
          <span className="agatha-paw-2" style={{ fontSize: 16 }}>🐾</span>
          <span className="agatha-paw-3" style={{ fontSize: 16 }}>🐾</span>
        </div>
      </div>
    </>
  )
}
