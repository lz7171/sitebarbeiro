// app/api/admin/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createAdminToken } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'
import { loginSchema } from '@/lib/validations'

export async function POST(req: NextRequest) {
  // Rate limit SEVERO para login: 5 tentativas a cada 15 minutos, depois bloqueia 30 min
  const ip = req.headers.get('x-forwarded-for') ?? 'anon'
  const limit = rateLimit(`login:${ip}`, {
    maxRequests: 5,
    windowMs: 15 * 60_000,
    blockDurationMs: 30 * 60_000,
  })

  if (!limit.allowed) {
    return NextResponse.json(
      { error: `Muitas tentativas. Aguarde ${limit.retryAfter} segundos.` },
      { status: 429 }
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Requisição inválida' }, { status: 400 })
  }

  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    // Mensagem genérica para não revelar validação
    return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
  }

  const { username, password } = parsed.data

  const adminUsername = process.env.ADMIN_USERNAME
  const adminHash = process.env.ADMIN_PASSWORD_HASH

  if (!adminUsername || !adminHash) {
    console.error('ADMIN_USERNAME ou ADMIN_PASSWORD_HASH não configurados')
    return NextResponse.json({ error: 'Erro de configuração do servidor' }, { status: 500 })
  }

  // Timing-safe comparison
  const usernameMatch = username === adminUsername
  const passwordMatch = await bcrypt.compare(password, adminHash)

  if (!usernameMatch || !passwordMatch) {
    // Delay artificial para dificultar timing attacks
    await new Promise(r => setTimeout(r, 500 + Math.random() * 500))
    return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
  }

  const token = await createAdminToken(username)

  const response = NextResponse.json({ success: true })
  response.cookies.set('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 horas
  })

  return response
}
