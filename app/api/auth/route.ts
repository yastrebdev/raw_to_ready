// app/api/auth/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { checkAdminPassword, setAuthCookie, clearAuthCookie } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { password } = await req.json()

  if (!checkAdminPassword(password)) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  await setAuthCookie()
  return NextResponse.json({ success: true })
}

export async function DELETE() {
  await clearAuthCookie()
  return NextResponse.json({ success: true })
}
