// app/api/admin/settings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getAdminSession } from '@/lib/auth'
import { settingsSchema } from '@/lib/validations'

// GET: configurações públicas (aberto/fechado, anúncio)
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('settings')
    .select('is_open, announcement')
    .single()

  if (error) return NextResponse.json({ is_open: false, announcement: null })

  return NextResponse.json(data)
}

// PATCH: atualiza configurações (protegido)
export async function PATCH(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = settingsSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('settings')
    .update(parsed.data)
    .eq('id', 1)
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Erro ao salvar' }, { status: 500 })

  return NextResponse.json({ success: true, settings: data })
}

// POST: logout admin
export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.set('admin_session', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  })
  return response
}
