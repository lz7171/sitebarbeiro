// app/api/admin/appointments/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/mockdb'

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get('date') ?? undefined
  const appointments = db.getAppointments(undefined, date)
  return NextResponse.json({ appointments })
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  if (!id) {
    return NextResponse.json({ error: 'ID não fornecido' }, { status: 400 })
  }

  const success = db.deleteAppointment(id)
  if (!success) {
    return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
