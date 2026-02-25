// app/api/admin/slots/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getAdminSession } from '@/lib/auth'
import { slotSchema } from '@/lib/validations'
import { isFutureDate } from '@/lib/sanitize'

// GET: lista todos os slots (admin)
export async function GET(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const date = req.nextUrl.searchParams.get('date')

  let query = supabaseAdmin
    .from('available_slots')
    .select('*')
    .order('date', { ascending: true })
    .order('time', { ascending: true })

  if (date) query = query.eq('date', date)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: 'Erro interno' }, { status: 500 })

  return NextResponse.json({ slots: data })
}

// POST: cria novo slot
export async function POST(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = slotSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten() }, { status: 400 })
  }

  const { date, time } = parsed.data

  if (!isFutureDate(date)) {
    return NextResponse.json({ error: 'Não é possível criar slots no passado' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('available_slots')
    .insert({ date, time, is_available: true })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Horário já existe para esta data' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Erro ao criar slot' }, { status: 500 })
  }

  return NextResponse.json({ slot: data }, { status: 201 })
}

// DELETE: remove slot
export async function DELETE(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })

  const { error } = await supabaseAdmin
    .from('available_slots')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: 'Erro ao remover slot' }, { status: 500 })

  return NextResponse.json({ success: true })
}
