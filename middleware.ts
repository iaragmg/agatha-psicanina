/**
 * Edge-compatible middleware.
 *
 * Does NOT import src/lib/auth.ts (which pulls Prisma + bcrypt — Node-only).
 * NextAuth v5 can verify the JWT cookie on the Edge using only AUTH_SECRET —
 * no database, no providers, no bcrypt involved.
 */

import NextAuth from 'next-auth'

// Minimal NextAuth instance for Edge: verifies the JWT cookie via AUTH_SECRET.
// providers: [] satisfies the required field without importing any Node module.
const { auth } = NextAuth({
  providers: [],
  secret: process.env.AUTH_SECRET,
  session: { strategy: 'jwt' },
})

// Routes that require authentication
const PROTECTED = ['/dashboard', '/admin']
// Routes only for unauthenticated users
const AUTH_ONLY = ['/login', '/register']

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  if (PROTECTED.some((p) => pathname.startsWith(p)) && !isLoggedIn) {
    return Response.redirect(new URL('/login', req.url))
  }

  if (AUTH_ONLY.some((p) => pathname.startsWith(p)) && isLoggedIn) {
    return Response.redirect(new URL('/dashboard', req.url))
  }
})

export const config = {
  // Exclude static assets, images, and the auth API itself.
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
}
