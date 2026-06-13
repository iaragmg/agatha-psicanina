/**
 * Teste unitário do rate limiter — sem servidor, sem banco, sem OpenAI.
 *
 * Execução:
 *   npx tsx --test src/lib/__tests__/rate-limit.test.ts
 */

import { describe, it, after } from 'node:test'
import assert from 'node:assert/strict'
import { createRateLimiter, getClientIp } from '../rate-limit.js'

// ─── Instância isolada para os testes ────────────────────────────────────────
// MAX=3, janela de 1 s — rápido o suficiente para testar reset sem esperar 1 min.
const MAX       = 3
const WINDOW_MS = 1000

const limiter = createRateLimiter(MAX, WINDOW_MS)

after(() => limiter.destroy()) // libera o setInterval ao fim da suite

// ─── Helpers ─────────────────────────────────────────────────────────────────

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

// Cada teste usa um IP único para não interferir nos outros.
let counter = 0
const ip = () => `192.168.1.${++counter}`

// ─── checkRateLimit ───────────────────────────────────────────────────────────

describe('checkRateLimit', () => {
  it('permite requisições até o limite (MAX=3)', () => {
    const id = ip()
    const r1 = limiter.check(id)
    const r2 = limiter.check(id)
    const r3 = limiter.check(id)

    assert.equal(r1.success, true,  '1ª req deve passar')
    assert.equal(r2.success, true,  '2ª req deve passar')
    assert.equal(r3.success, true,  '3ª req deve passar')

    assert.equal(r1.remaining, 2, 'remaining após 1ª req')
    assert.equal(r2.remaining, 1, 'remaining após 2ª req')
    assert.equal(r3.remaining, 0, 'remaining após 3ª req')
  })

  it('bloqueia a (MAX+1)ª requisição', () => {
    const id = ip()
    limiter.check(id) // 1
    limiter.check(id) // 2
    limiter.check(id) // 3

    const blocked = limiter.check(id) // 4 — deve bloquear

    assert.equal(blocked.success,   false, '4ª req deve ser bloqueada')
    assert.equal(blocked.remaining, 0,     'remaining deve ser 0')
    assert.ok(blocked.retryAfter > 0,      'retryAfter deve ser positivo')
    assert.ok(blocked.resetAt > Date.now(),'resetAt deve ser no futuro')
  })

  it('não conta a requisição bloqueada no total', () => {
    const id = ip()
    limiter.check(id) // 1
    limiter.check(id) // 2
    limiter.check(id) // 3

    const b1 = limiter.check(id) // bloqueada
    const b2 = limiter.check(id) // bloqueada

    assert.equal(b1.success, false)
    assert.equal(b2.success, false)
    // retryAfter não deve crescer entre chamadas bloqueadas consecutivas
    assert.ok(b2.retryAfter <= b1.retryAfter + 1)
  })

  it('libera o slot após a janela expirar (aguarda 1,1 s)', async () => {
    const id = ip()
    limiter.check(id) // 1
    limiter.check(id) // 2
    limiter.check(id) // 3

    const blocked = limiter.check(id) // 4 — bloqueado
    assert.equal(blocked.success, false, 'deve estar bloqueado antes do reset')

    await wait(WINDOW_MS + 100) // aguarda janela + margem

    const after = limiter.check(id)
    assert.equal(after.success,   true, 'deve liberar após a janela')
    assert.equal(after.remaining, 2,    'remaining deve voltar a MAX-1')
  })

  it('IPs diferentes têm contadores independentes', () => {
    const idA = ip()
    const idB = ip()

    // Esgota idA
    limiter.check(idA)
    limiter.check(idA)
    limiter.check(idA)
    const blockedA = limiter.check(idA) // 4 — bloqueado

    const okB = limiter.check(idB) // idB não deve ser afetado

    assert.equal(blockedA.success, false, 'idA deve estar bloqueado')
    assert.equal(okB.success,      true,  'idB deve passar livremente')
    assert.equal(okB.remaining,    2,     'idB deve ter remaining = MAX-1')
  })
})

// ─── getClientIp ─────────────────────────────────────────────────────────────

describe('getClientIp', () => {
  it('extrai o primeiro IP de x-forwarded-for com lista', () => {
    const h = new Headers({ 'x-forwarded-for': '1.2.3.4, 10.0.0.1, 172.16.0.1' })
    assert.equal(getClientIp(h), '1.2.3.4')
  })

  it('usa x-real-ip quando x-forwarded-for está ausente', () => {
    const h = new Headers({ 'x-real-ip': '5.6.7.8' })
    assert.equal(getClientIp(h), '5.6.7.8')
  })

  it('retorna "unknown" quando nenhum header de IP está presente', () => {
    assert.equal(getClientIp(new Headers()), 'unknown')
  })

  it('x-forwarded-for tem prioridade sobre x-real-ip', () => {
    const h = new Headers({ 'x-forwarded-for': '1.2.3.4', 'x-real-ip': '9.9.9.9' })
    assert.equal(getClientIp(h), '1.2.3.4')
  })
})
