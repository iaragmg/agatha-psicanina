'use client'

import { useState, type FormEvent } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { BrandLogo } from '@/components/layout/BrandLogo'

const TEXTS = {
  title:         'Entrar na Clínica',
  subtitle:      'A Agatha guardou seu histórico. Bem-vinda de volta.',
  labelEmail:    'E-mail',
  labelPassword: 'Senha',
  btnSubmit:     'Entrar',
  btnLoading:    'Entrando...',
  linkRegister:  'Criar conta',
  linkRegisterPre: 'Não tem conta?',
  linkAnon:      'Continuar sem conta',
  errorInvalid:  'E-mail ou senha incorretos.',
  errorGeneric:  'Erro ao fazer login. Tente novamente.',
  placeholderEmail:    'seu@email.com',
  placeholderPassword: '••••••••',
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/chat'

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError(result.error === 'CredentialsSignin' ? TEXTS.errorInvalid : TEXTS.errorGeneric)
      return
    }

    router.push(callbackUrl)
    router.refresh()
  }

  return (
    <>
      <style>{`
        @keyframes fade-in { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .auth-card { animation: fade-in .4s ease both }
        .auth-input:focus { outline: none; border-color: rgba(74,144,217,0.7) !important; box-shadow: 0 0 0 3px rgba(74,144,217,0.15) }
        .auth-btn:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px) }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0d0d1a 0%, #130d26 50%, #0d0d1a 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px 16px',
        fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)',
      }}>
        <div className="auth-card" style={{ width: '100%', maxWidth: 400 }}>
          {/* Branding */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <BrandLogo width={160} showCrp={false} align="center" />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#f0f0ff', margin: '0 0 8px' }}>
              {TEXTS.title}
            </h1>
            <p style={{ fontSize: 13, color: 'rgba(240,240,255,0.45)', margin: 0 }}>
              {TEXTS.subtitle}
            </p>
          </div>

          {/* Card */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 20,
            padding: '28px 24px',
            backdropFilter: 'blur(24px)',
          }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* E-mail */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(240,240,255,0.6)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {TEXTS.labelEmail}
                </label>
                <input
                  className="auth-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={TEXTS.placeholderEmail}
                  style={{
                    width: '100%', padding: '12px 14px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 12, color: '#f0f0ff',
                    fontSize: 14, boxSizing: 'border-box',
                    transition: 'border-color 0.18s, box-shadow 0.18s',
                  }}
                />
              </div>

              {/* Senha */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(240,240,255,0.6)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {TEXTS.labelPassword}
                </label>
                <input
                  className="auth-input"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={TEXTS.placeholderPassword}
                  style={{
                    width: '100%', padding: '12px 14px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 12, color: '#f0f0ff',
                    fontSize: 14, boxSizing: 'border-box',
                    transition: 'border-color 0.18s, box-shadow 0.18s',
                  }}
                />
              </div>

              {/* Erro */}
              {error && (
                <p style={{
                  fontSize: 13, color: '#e74c3c',
                  background: 'rgba(231,76,60,0.1)',
                  border: '1px solid rgba(231,76,60,0.25)',
                  borderRadius: 10, padding: '10px 14px',
                  margin: 0,
                }}>
                  {error}
                </p>
              )}

              {/* Botão submit */}
              <button
                className="auth-btn"
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '14px',
                  borderRadius: 14, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: 15, fontWeight: 700, color: '#fff',
                  background: 'linear-gradient(135deg, rgba(74,144,217,0.9), rgba(155,89,182,0.9))',
                  boxShadow: '0 4px 20px rgba(74,144,217,0.2)',
                  transition: 'all 0.18s ease',
                  opacity: loading ? 0.7 : 1,
                  marginTop: 4,
                }}
              >
                {loading ? TEXTS.btnLoading : TEXTS.btnSubmit}
              </button>
            </form>
          </div>

          {/* Links */}
          <div style={{ textAlign: 'center', marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ fontSize: 13, color: 'rgba(240,240,255,0.4)', margin: 0 }}>
              {TEXTS.linkRegisterPre}{' '}
              <Link href="/register" style={{ color: 'rgba(74,144,217,0.9)', fontWeight: 600, textDecoration: 'none' }}>
                {TEXTS.linkRegister}
              </Link>
            </p>
            <Link href="/chat" style={{ fontSize: 12, color: 'rgba(240,240,255,0.25)', textDecoration: 'none' }}>
              {TEXTS.linkAnon}
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
