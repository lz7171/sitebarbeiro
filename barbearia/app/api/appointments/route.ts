// app/api/appointments/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { bookingSchema } from '@/lib/validations'
import { sanitizeName, sanitizePhone, isFutureDate } from '@/lib/sanitize'

// Preço FIXO — nunca aceito do cliente
const FIXED_PRICE = 20.00
const FIXED_SERVICE = 'Corte Masculino'

export async function POST(req: NextRequest) {
  // Rate limit agressivo para agendamentos: 5/minuto por IP
  const ip = req.headers.get('x-forwarded-for') ?? 'anon'
  const limit = rateLimit(`appt:${ip}`, {
    maxRequests: 5,
    windowMs: 60_000,
    blockDurationMs: 10 * 60_000, // bloqueia 10 min após exceder
  })
  if (!limit.allowed) {
    return NextResponse.json(
      { error: `Muitas tentativas. Tente novamente em ${limit.retryAfter}s.` },
      { status: 429 }
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  // Valida com Zod
  const parsed = bookingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { name: rawName, phone: rawPhone, date, time } = parsed.data

  // Sanitiza inputs
  const name = sanitizeName(rawName)
  const phone = sanitizePhone(rawPhone)

  if (!name || name.length < 2) {
    return NextResponse.json({ error: 'Nome inválido' }, { status: 400 })
  }

  if (!isFutureDate(date)) {
    return NextResponse.json({ error: 'Data no passado' }, { status: 400 })
  }

  // 1. Verifica se barbearia está aberta
  const { data: settings } = await supabaseAdmin
    .from('settings')
    .select('is_open')
    .single()

  if (!settings?.is_open) {
    return NextResponse.json({ error: 'Barbearia fechada no momento' }, { status: 409 })
  }

  // 2. Verifica se horário existe na tabela de slots
  const { data: slot } = await supabaseAdmin
    .from('available_slots')
    .select('id, is_available')
    .eq('date', date)
    .eq('time', time)
    .single()

  if (!slot || !slot.is_available) {
    return NextResponse.json({ error: 'Horário não disponível' }, { status: 409 })
  }

  // 3. Verifica duplo agendamento com FOR UPDATE (via upsert + constraint único)
  const { data: existing } = await supabaseAdmin
    .from('appointments')
    .select('id')
    .eq('date', date)
    .eq('time', time)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'Horário já reservado' }, { status: 409 })
  }

  // 4. Insere agendamento (constraint UNIQUE no banco bloqueia race conditions)
  const { data: appointment, error } = await supabaseAdmin
    .from('appointments')
    .insert({
      name,
      phone,
      date,
      time,
      service: FIXED_SERVICE,
      price: FIXED_PRICE,
    })
    .select('id, name, date, time, service, price')
    .single()

  if (error) {
    // Código 23505 = violação de unique constraint no PostgreSQL
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Horário já reservado' }, { status: 409 })
    }
    console.error('[appointments POST]', error)
    return NextResponse.json({ error: 'Erro ao salvar' }, { status: 500 })
  }

  return NextResponse.json({ success: true, appointment }, { status: 201 })
}
