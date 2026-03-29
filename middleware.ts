// middleware.ts
import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Protect admin routes (except login)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const session = req.cookies.get('admin_session')
    if (session?.value !== 'authenticated') {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  // Protect admin API routes
  if (req.method !== 'GET' && pathname.startsWith('/api/')) {
    const session = req.cookies.get('admin_session')
    if (session?.value !== 'authenticated') {
      // Exception: auth endpoint itself
      if (!pathname.startsWith('/api/auth')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
}
