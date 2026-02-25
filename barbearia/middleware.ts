// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

// Rotas que exigem autenticação admin
const PROTECTED_PREFIXES = ['/admin']

// A rota de login em si NÃO é protegida
const PUBLIC_ADMIN_PATHS = ['/admin-login-secreto-nao-divulgar']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED_PREFIXES.some(p => pathname.startsWith(p))
  const isPublic = PUBLIC_ADMIN_PATHS.some(p => pathname.startsWith(p))

  if (isProtected && !isPublic) {
    const token = request.cookies.get('admin_session')?.value

    if (!token) {
      return NextResponse.redirect(
        new URL('/admin-login-secreto-nao-divulgar', request.url)
      )
    }

    try {
      await jwtVerify(token, JWT_SECRET)
      return NextResponse.next()
    } catch {
      const response = NextResponse.redirect(
        new URL('/admin-login-secreto-nao-divulgar', request.url)
      )
      response.cookies.delete('admin_session')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
