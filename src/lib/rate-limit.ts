/**
 * In-memory sliding-window rate limiter.
 *
 * Stores a list of request timestamps per key (IP address).
 * Suitable for single-instance deployments (dev + Vercel serverless with one instance).
 * For multi-instance prod, swap the Map for Redis (e.g. @upstash/ratelimit).
 *
 * Config via env vars (both optional):
 *   RATE_LIMIT_MAX        — max requests per window (default: 20)
 *   RATE_LIMIT_WINDOW_MS  — window duration in ms   (default: 60000 = 1 min)
 */

export interface RateLimitResult {
  success: boolean
  /** Requests remaining in the current window. */
  remaining: number
  /** Unix ms when the oldest request in the window expires. */
  resetAt: number
  /** Seconds until reset (for Retry-After header). */
  retryAfter: number
}

// ─── Factory ─────────────────────────────────────────────────────────────────
// Exported so tests can create isolated instances with custom max/windowMs
// without touching process.env or relying on module-level singletons.

export function createRateLimiter(max: number, windowMs: number) {
  const store = new Map<string, number[]>()

  // Prune store periodically to prevent unbounded memory growth.
  let timer: ReturnType<typeof setInterval> | null = null
  if (typeof setInterval !== 'undefined') {
    timer = setInterval(() => {
      const cutoff = Date.now() - windowMs
      for (const [key, timestamps] of store) {
        const fresh = timestamps.filter((t) => t > cutoff)
        if (fresh.length === 0) {
          store.delete(key)
        } else {
          store.set(key, fresh)
        }
      }
    }, windowMs)
    // Don't block process exit in tests
    if (timer.unref) timer.unref()
  }

  function check(ip: string): RateLimitResult {
    const now = Date.now()
    const cutoff = now - windowMs

    const timestamps = (store.get(ip) ?? []).filter((t) => t > cutoff)

    const success = timestamps.length < max

    if (success) {
      timestamps.push(now)
      store.set(ip, timestamps)
    }

    const oldest = timestamps[0] ?? now
    const resetAt = oldest + windowMs
    const retryAfter = Math.ceil((resetAt - now) / 1000)

    return {
      success,
      remaining: Math.max(0, max - timestamps.length),
      resetAt,
      retryAfter,
    }
  }

  /** Frees the cleanup interval. Call in test teardown. */
  function destroy() {
    if (timer) clearInterval(timer)
  }

  return { check, destroy }
}

// ─── Singleton (app) ─────────────────────────────────────────────────────────

const MAX       = parseInt(process.env.RATE_LIMIT_MAX       ?? '20',    10)
const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '60000', 10)

const _appLimiter = createRateLimiter(MAX, WINDOW_MS)

export function checkRateLimit(ip: string): RateLimitResult {
  return _appLimiter.check(ip)
}

// ─── IP extraction ───────────────────────────────────────────────────────────

/** Extract the best available client IP from Next.js request headers. */
export function getClientIp(headers: Headers): string {
  // x-forwarded-for may contain a comma-separated list; first entry is the client
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()

  const realIp = headers.get('x-real-ip')
  if (realIp) return realIp.trim()

  return 'unknown'
}
