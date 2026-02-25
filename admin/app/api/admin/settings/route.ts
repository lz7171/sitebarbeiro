// app/api/admin/settings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/mockdb'
import { settingsSchema } from '@/lib/validations'

export async function GET() {
  const settings = db.getSettings()
  return NextResponse.json(settings)
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const parsed = settingsSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos' },
      { status: 400 }
    )
  }

  const settings = db.updateSettings(parsed.data)
  return NextResponse.json(settings)
}

export async function DELETE() {
  // Logout route
  const response = NextResponse.json({ success: true })
  response.cookies.delete('admin_session')
  return response
}
