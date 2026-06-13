/**
 * Teste de integração HTTP para o rate limiting de /api/chat.
 *
 * Envia requisições com corpo INVÁLIDO propositalmente — o servidor retorna 400
 * (falha na validação Zod) sem nunca chamar a OpenAI. Quando o limite é atingido,
 * passa a retornar 429. Nenhuma chamada real de IA é feita.
 *
 * Pré-requisito: servidor rodando em http://localhost:3000
 *   npm run dev
 *
 * Execução:
 *   node scripts/test-rate-limit-http.mjs
 *
 * Para testar com limite baixo (sem alterar o .env.local):
 *   RATE_LIMIT_MAX=3 node scripts/test-rate-limit-http.mjs
 */

const BASE_URL = process.env.APP_URL ?? 'http://localhost:3000'
const ENDPOINT = `${BASE_URL}/api/chat`
const TOTAL_REQUESTS = parseInt(process.env.TEST_REQUESTS ?? '25', 10)

// Corpo inválido: passa o parse de JSON mas falha na validação Zod →
// retorna 400 antes de qualquer consulta ao banco ou à OpenAI.
const INVALID_BODY = JSON.stringify({ not: 'a valid chat body' })

// ─── Cores ANSI ──────────────────────────────────────────────────────────────
const c = {
  reset:  '\x1b[0m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  red:    '\x1b[31m',
  cyan:   '\x1b[36m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
}

function statusColor(status) {
  if (status === 429) return c.red
  if (status === 400) return c.green
  if (status >= 500)  return c.yellow
  return c.dim
}

// ─── Main ─────────────────────────────────────────────────────────────────────

console.log(`\n${c.bold}Rate Limit — Teste de Integração HTTP${c.reset}`)
console.log(`${c.dim}Endpoint : ${ENDPOINT}`)
console.log(`Requests : ${TOTAL_REQUESTS}`)
console.log(`Esperado : 400 até o limite, depois 429${c.reset}\n`)

let passed   = 0   // 400 — chegou à validação (antes da OpenAI)
let blocked  = 0   // 429 — rate limit atingido
let other    = 0   // qualquer outro status

for (let i = 1; i <= TOTAL_REQUESTS; i++) {
  let status
  let body
  let retryAfter = null

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: INVALID_BODY,
    })
    status     = res.status
    body       = await res.json().catch(() => null)
    retryAfter = res.headers.get('retry-after')
  } catch (err) {
    console.error(`  #${i.toString().padStart(2)} ${c.yellow}ERRO DE REDE:${c.reset}`, err.message)
    other++
    continue
  }

  const color  = statusColor(status)
  const label  = status === 429 ? '🚫 BLOQUEADO' : status === 400 ? '✅ OK (400)' : `⚠️  ${status}`
  const extra  = status === 429 && retryAfter ? `  Retry-After: ${retryAfter}s` : ''
  const detail = body?.error ? `  "${body.error}"` : ''

  console.log(`  #${i.toString().padStart(2)}  ${color}${label}${c.reset}${c.dim}${extra}${detail}${c.reset}`)

  if (status === 400) passed++
  else if (status === 429) blocked++
  else other++
}

// ─── Resumo ───────────────────────────────────────────────────────────────────

console.log(`\n${c.bold}Resumo${c.reset}`)
console.log(`  ${c.green}Passaram (400)  : ${passed}${c.reset}`)
console.log(`  ${c.red}Bloqueadas (429): ${blocked}${c.reset}`)
if (other > 0) console.log(`  ${c.yellow}Outros          : ${other}${c.reset}`)

if (blocked > 0) {
  console.log(`\n${c.bold}${c.green}✅ Rate limiting funcionando.${c.reset}`)
} else {
  console.log(`\n${c.yellow}⚠️  Nenhum 429 recebido. Verifique RATE_LIMIT_MAX e tente aumentar TEST_REQUESTS.`)
  console.log(`   Dica: RATE_LIMIT_MAX=3 node scripts/test-rate-limit-http.mjs${c.reset}`)
}

console.log()
