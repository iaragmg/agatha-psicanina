import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="glass-strong glow-blue p-10 text-center max-w-md w-full">
        <span className="text-6xl block mb-4">🐾</span>
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          Agatha PsiCanina
        </h1>
        <p
          className="text-sm mb-6"
          style={{ color: 'var(--text-secondary)' }}
        >
          Shih Tzu · Especialista em Comportamento Humano Bizarro
        </p>
        <div
          className="text-xs rounded-lg p-3 mb-6 text-left border"
          style={{
            background: 'rgba(255,200,50,0.06)',
            borderColor: 'rgba(255,200,50,0.2)',
            color: 'var(--text-secondary)',
          }}
        >
          ⚠️{' '}
          <strong style={{ color: 'var(--text-primary)' }}>Isto é entretenimento.</strong>{' '}
          Agatha não é psicóloga. Nenhum diagnóstico real será emitido. Se precisar de
          ajuda, ligue para o CVV:{' '}
          <strong style={{ color: 'var(--text-primary)' }}>188</strong> (24h, gratuito).
        </div>
        <Link
          href="/chat"
          className="block w-full py-3 rounded-xl font-semibold text-white text-center transition-all hover:opacity-90 active:scale-95"
          style={{ background: 'var(--accent-blue)' }}
        >
          Iniciar Consulta
        </Link>
      </div>
    </main>
  )
}
