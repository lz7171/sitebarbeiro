// app/api/slots/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/mockdb'
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

  // Busca slots e agendamentos
  const agendamentos = db.getAppointments()
  const takenTimes = new Set(
    agendamentos
      .filter(a => a.date === date)
      .map(a => a.time)
  )

  const slots = db.getSlots(date, takenTimes)

  return NextResponse.json({ slots })
}

