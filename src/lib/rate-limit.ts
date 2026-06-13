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

const MAX = parseInt(process.env.RATE_LIMIT_MAX ?? '20', 10)
const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '60000', 10)

// Map<ip, timestamp[]>
const store = new Map<string, number[]>()

// Prune the store every WINDOW_MS to prevent unbounded growth.
// Only runs on the server (Node.js runtime), safe to call at module level.
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const cutoff = Date.now() - WINDOW_MS
    for (const [key, timestamps] of store) {
      const fresh = timestamps.filter((t) => t > cutoff)
      if (fresh.length === 0) {
        store.delete(key)
      } else {
        store.set(key, fresh)
      }
    }
  }, WINDOW_MS)
}

export interface RateLimitResult {
  success: boolean
  /** Requests remaining in the current window. */
  remaining: number
  /** Unix ms when the oldest request in the window expires. */
  resetAt: number
  /** Seconds until reset (for Retry-After header). */
  retryAfter: number
}

export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now()
  const cutoff = now - WINDOW_MS

  const timestamps = (store.get(ip) ?? []).filter((t) => t > cutoff)

  const success = timestamps.length < MAX

  if (success) {
    timestamps.push(now)
    store.set(ip, timestamps)
  }

  const oldest = timestamps[0] ?? now
  const resetAt = oldest + WINDOW_MS
  const retryAfter = Math.ceil((resetAt - now) / 1000)

  return {
    success,
    remaining: Math.max(0, MAX - timestamps.length),
    resetAt,
    retryAfter,
  }
}

/** Extract the best available client IP from Next.js request headers. */
export function getClientIp(headers: Headers): string {
  // x-forwarded-for may contain a comma-separated list; first entry is the client
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()

  const realIp = headers.get('x-real-ip')
  if (realIp) return realIp.trim()

  return 'unknown'
}
