// app/api/appointments/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/mockdb'
import { rateLimit } from '@/lib/rate-limit'
import { bookingSchema } from '@/lib/validations'
import { sanitizeName, sanitizePhone, isFutureDate } from '@/lib/sanitize'

const FIXED_PRICE = 20.00
const FIXED_SERVICE = 'Corte Masculino'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'anon'
  const limit = rateLimit(`appt:${ip}`, {
    maxRequests: 5,
    windowMs: 60_000,
    blockDurationMs: 10 * 60_000,
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

  const parsed = bookingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { name: rawName, phone: rawPhone, date, time } = parsed.data
  const name = sanitizeName(rawName)
  const phone = sanitizePhone(rawPhone)

  if (!name || name.length < 2) {
    return NextResponse.json({ error: 'Nome inválido' }, { status: 400 })
  }
  if (!phone || phone.length < 10) {
    return NextResponse.json({ error: 'Telefone inválido' }, { status: 400 })
  }
  if (!isFutureDate(date)) {
    return NextResponse.json({ error: 'Data no passado' }, { status: 400 })
  }

  const settings = db.getSettings()
  if (!settings.is_open) {
    return NextResponse.json({ error: 'Barbearia fechada no momento' }, { status: 409 })
  }

  const slots = db.getSlots(date)
  if (!slots.some(s => s.time === time)) {
    return NextResponse.json({ error: 'Horário não disponível' }, { status: 409 })
  }

  const agendamentos = db.getAppointments()
  if (agendamentos.some(a => a.date === date && a.time === time)) {
    return NextResponse.json({ error: 'Horário já reservado' }, { status: 409 })
  }

  const appointment = db.addAppointment(name, phone, date, time)

  return NextResponse.json({
    success: true,
    appointment: {
      id: appointment.id,
      name: appointment.name,
      date: appointment.date,
      time: appointment.time,
      service: appointment.service,
      price: appointment.price,
    },
  }, { status: 201 })
}

export async function GET() {
  const agendamentos = db.getAppointments()
  return NextResponse.json({ appointments: agendamentos })
}
