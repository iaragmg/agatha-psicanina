import Link from 'next/link'
import { auth, signOut } from '@/lib/auth'

const TEXTS = {
  tag:         'Consultório PsiCanino',
  title:       'Agatha PsiCanina',
  btnRanking:  '🏆 Ranking da Clínica',
  subtitle:    'Shih Tzu · Especialista em Comportamento Humano Bizarro',
  disclaimer:  'Isto é entretenimento.',
  disclaimerDetail: 'Agatha não é psicóloga. Nenhum diagnóstico real será emitido. Se precisar de ajuda, ligue para o CVV:',
  cvv:         '188 (24h, gratuito)',
  btnConsult:  'Iniciar Consulta',
  btnProntuario: '📚 Meu Prontuário',
  btnLogout:   'Sair',
  greeting:    'Olá,',
  anonHint:    'Crie uma conta para salvar seu histórico em qualquer dispositivo.',
  btnRegister: '🔑 Criar conta grátis',
  btnLogin:    'Já tenho conta',
}

export default async function Home() {
  const session = await auth().catch(() => null)
  const user = session?.user

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0d0d1a 0%, #130d26 50%, #0d0d1a 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '24px 16px',
        fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)',
      }}
    >
      <div style={{
        width: '100%', maxWidth: 420,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 24,
        padding: '36px 28px',
        backdropFilter: 'blur(24px)',
        boxShadow: '0 0 60px rgba(74,144,217,0.1), 0 0 100px rgba(155,89,182,0.06)',
        textAlign: 'center',
      }}>
        {/* Avatar */}
        <div style={{ fontSize: 64, marginBottom: 12, lineHeight: 1 }}>🐾</div>

        {/* Título */}
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f0f0ff', margin: '0 0 6px' }}>
          {TEXTS.title}
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(240,240,255,0.45)', margin: '0 0 24px' }}>
          {TEXTS.subtitle}
        </p>

        {/* Disclaimer */}
        <div style={{
          fontSize: 12, borderRadius: 12, padding: '12px 14px',
          marginBottom: 24, textAlign: 'left',
          background: 'rgba(255,200,50,0.06)',
          border: '1px solid rgba(255,200,50,0.18)',
          color: 'rgba(240,240,255,0.5)',
          lineHeight: 1.6,
        }}>
          ⚠️{' '}
          <strong style={{ color: '#f0f0ff' }}>{TEXTS.disclaimer}</strong>{' '}
          {TEXTS.disclaimerDetail}{' '}
          <strong style={{ color: '#f0f0ff' }}>{TEXTS.cvv}</strong>.
        </div>

        {user ? (
          /* ── Usuário logado ─────────────────────────────── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ fontSize: 13, color: 'rgba(240,240,255,0.5)', margin: '0 0 4px' }}>
              {TEXTS.greeting} <strong style={{ color: '#f0f0ff' }}>{user.name ?? user.email}</strong> 👋
            </p>

            <Link
              href="/chat"
              style={{
                display: 'block', width: '100%', padding: '14px',
                borderRadius: 14, border: 'none',
                fontSize: 15, fontWeight: 700, color: '#fff',
                background: 'linear-gradient(135deg, rgba(74,144,217,0.9), rgba(155,89,182,0.9))',
                boxShadow: '0 4px 20px rgba(74,144,217,0.22)',
                textDecoration: 'none',
              }}
            >
              {TEXTS.btnConsult}
            </Link>

            <Link
              href="/prontuario"
              style={{
                display: 'block', width: '100%', padding: '13px',
                borderRadius: 14,
                border: '1.5px solid rgba(155,89,182,0.45)',
                fontSize: 14, fontWeight: 600,
                color: 'rgba(195,155,211,0.95)',
                background: 'rgba(155,89,182,0.07)',
                textDecoration: 'none',
              }}
            >
              {TEXTS.btnProntuario}
            </Link>

            <Link
              href="/ranking"
              style={{
                display: 'block', width: '100%', padding: '11px',
                borderRadius: 12,
                border: '1px solid rgba(201,168,76,0.2)',
                fontSize: 13, fontWeight: 600,
                color: 'rgba(201,168,76,0.7)',
                background: 'transparent',
                textDecoration: 'none',
              }}
            >
              {TEXTS.btnRanking}
            </Link>

            <form
              action={async () => {
                'use server'
                await signOut({ redirectTo: '/' })
              }}
            >
              <button
                type="submit"
                style={{
                  width: '100%', padding: '11px',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'transparent', cursor: 'pointer',
                  fontSize: 13, color: 'rgba(240,240,255,0.3)',
                }}
              >
                {TEXTS.btnLogout}
              </button>
            </form>
          </div>
        ) : (
          /* ── Usuário anônimo ────────────────────────────── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* CTA principal: Iniciar Consulta */}
            <Link
              href="/chat"
              style={{
                display: 'block', width: '100%', padding: '14px',
                borderRadius: 14,
                fontSize: 15, fontWeight: 700, color: '#fff',
                background: 'linear-gradient(135deg, rgba(74,144,217,0.9), rgba(155,89,182,0.9))',
                boxShadow: '0 4px 20px rgba(74,144,217,0.22)',
                textDecoration: 'none',
              }}
            >
              {TEXTS.btnConsult}
            </Link>

            {/* Separador */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0',
            }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
              <span style={{ fontSize: 11, color: 'rgba(240,240,255,0.25)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                ou
              </span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            </div>

            {/* Hint sobre conta */}
            <p style={{ fontSize: 12, color: 'rgba(240,240,255,0.38)', margin: '0 0 2px', lineHeight: 1.6 }}>
              {TEXTS.anonHint}
            </p>

            <Link
              href="/register"
              style={{
                display: 'block', width: '100%', padding: '13px',
                borderRadius: 14,
                fontSize: 14, fontWeight: 700, color: '#0d0b1e',
                background: 'linear-gradient(135deg, #e8c776, #c9a84c)',
                boxShadow: '0 4px 16px rgba(201,168,76,0.2)',
                textDecoration: 'none',
              }}
            >
              {TEXTS.btnRegister}
            </Link>

            <Link
              href="/login"
              style={{
                fontSize: 13, fontWeight: 600,
                color: 'rgba(74,144,217,0.8)',
                textDecoration: 'none',
              }}
            >
              {TEXTS.btnLogin}
            </Link>

            <Link
              href="/ranking"
              style={{
                fontSize: 12, fontWeight: 600,
                color: 'rgba(201,168,76,0.55)',
                textDecoration: 'none',
                marginTop: 4,
              }}
            >
              {TEXTS.btnRanking}
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
