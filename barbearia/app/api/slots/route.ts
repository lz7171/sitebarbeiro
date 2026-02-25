// app/api/slots/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { isValidDate } from '@/lib/sanitize'

export async function GET(req: NextRequest) {
  // Rate limit: 60 requests/minuto por IP
  const ip = req.headers.get('x-forwarded-for') ?? 'anon'
  const limit = rateLimit(`slots:${ip}`, { maxRequests: 60, windowMs: 60_000 })
  if (!limit.allowed) {
    return NextResponse.json({ error: 'Rate limit excedido' }, { status: 429 })
  }

  const date = req.nextUrl.searchParams.get('date')
  if (!date || !isValidDate(date)) {
    return NextResponse.json({ error: 'Data inválida' }, { status: 400 })
  }

  // Busca slots disponíveis para a data
  const { data: slots, error } = await supabaseAdmin
    .from('available_slots')
    .select('id, time, is_available')
    .eq('date', date)
    .eq('is_available', true)
    .order('time', { ascending: true })

  if (error) {
    console.error('[slots GET]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }

  // Filtra horários já agendados
  const { data: taken } = await supabaseAdmin
    .from('appointments')
    .select('time')
    .eq('date', date)

  const takenTimes = new Set((taken ?? []).map((a: { time: string }) => a.time))
  const available = (slots ?? []).filter((s: { time: string }) => !takenTimes.has(s.time))

  return NextResponse.json({ slots: available })
}
