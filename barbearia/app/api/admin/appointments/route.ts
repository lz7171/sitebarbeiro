// app/api/admin/appointments/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getAdminSession } from '@/lib/auth'

// GET: lista todos os agendamentos
export async function GET(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const date = req.nextUrl.searchParams.get('date')

  let query = supabaseAdmin
    .from('appointments')
    .select('*')
    .order('date', { ascending: true })
    .order('time', { ascending: true })

  if (date) query = query.eq('date', date)

  const { data, error } = await query
  if (error) {
    console.error('[admin appointments GET]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }

  return NextResponse.json({ appointments: data })
}

// DELETE: cancela agendamento
export async function DELETE(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })

  const { error } = await supabaseAdmin
    .from('appointments')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: 'Erro ao cancelar' }, { status: 500 })

  return NextResponse.json({ success: true })
}
