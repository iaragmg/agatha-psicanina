'use client'

import { useState, type FormEvent } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const TEXTS = {
  title:         'Abrir Prontuário',
  subtitle:      'Crie sua conta e a Agatha guarda todo seu histórico.',
  labelName:     'Seu nome',
  labelEmail:    'E-mail',
  labelPassword: 'Senha',
  btnSubmit:     'Criar conta',
  btnLoading:    'Criando...',
  linkLogin:     'Entrar',
  linkLoginPre:  'Já tem conta?',
  linkAnon:      'Continuar sem conta',
  placeholderName:     'Como você se chama?',
  placeholderEmail:    'seu@email.com',
  placeholderPassword: 'Mín. 8 caracteres, 1 maiúscula, 1 número',
  successMsg:    'Conta criada! Entrando...',
  errorEmail:    'Este e-mail já está cadastrado.',
  errorGeneric:  'Erro ao criar conta. Tente novamente.',
  hint:          '🔒 Sua senha é armazenada com criptografia.',
}

export default function RegisterPage() {
  const router = useRouter()

  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState(false)
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError((data as { error?: string }).error ?? TEXTS.errorGeneric)
      setLoading(false)
      return
    }

    setSuccess(true)

    // Faz login automático após registro
    await signIn('credentials', { email, password, redirect: false })
    router.push('/prontuario')
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
            <div style={{ fontSize: 48, marginBottom: 12 }}>🐾</div>
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
            {success ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                <p style={{ color: '#27ae60', fontWeight: 600, fontSize: 15, margin: 0 }}>
                  {TEXTS.successMsg}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Nome */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(240,240,255,0.6)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {TEXTS.labelName}
                  </label>
                  <input
                    className="auth-input"
                    type="text"
                    required
                    minLength={2}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={TEXTS.placeholderName}
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
                    minLength={8}
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
                  <p style={{ fontSize: 11, color: 'rgba(240,240,255,0.3)', margin: '6px 0 0' }}>
                    {TEXTS.hint}
                  </p>
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

                {/* Botão */}
                <button
                  className="auth-btn"
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%', padding: '14px',
                    borderRadius: 14, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: 15, fontWeight: 700, color: '#0d0b1e',
                    background: 'linear-gradient(135deg, #e8c776 0%, #c9a84c 100%)',
                    boxShadow: '0 4px 20px rgba(201,168,76,0.2)',
                    transition: 'all 0.18s ease',
                    opacity: loading ? 0.7 : 1,
                    marginTop: 4,
                  }}
                >
                  {loading ? TEXTS.btnLoading : TEXTS.btnSubmit}
                </button>
              </form>
            )}
          </div>

          {/* Links */}
          <div style={{ textAlign: 'center', marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ fontSize: 13, color: 'rgba(240,240,255,0.4)', margin: 0 }}>
              {TEXTS.linkLoginPre}{' '}
              <Link href="/login" style={{ color: 'rgba(74,144,217,0.9)', fontWeight: 600, textDecoration: 'none' }}>
                {TEXTS.linkLogin}
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
