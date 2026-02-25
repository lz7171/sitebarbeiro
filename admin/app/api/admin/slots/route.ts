// app/api/admin/slots/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/mockdb'
import { slotSchema } from '@/lib/validations'

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get('date')
  if (!date) {
    return NextResponse.json({ error: 'Data não fornecida' }, { status: 400 })
  }

  const slots = db.getSlots(date)
  return NextResponse.json({ slots })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = slotSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { date, time } = parsed.data
  const success = db.addSlot(date, time)

  if (!success) {
    return NextResponse.json({ error: 'Slot já existe' }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const { date, time } = await req.json()

  if (!date || !time) {
    return NextResponse.json({ error: 'Data e hora são obrigatórias' }, { status: 400 })
  }

  const success = db.deleteSlot(date, time)
  if (!success) {
    return NextResponse.json({ error: 'Slot não encontrado' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
