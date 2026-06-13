import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

// Rotas que exigem autenticação
const PROTECTED = ['/dashboard', '/admin']
// Rotas só para não autenticados
const AUTH_ONLY = ['/login', '/register']

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  if (PROTECTED.some((p) => pathname.startsWith(p)) && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (AUTH_ONLY.some((p) => pathname.startsWith(p)) && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
}
