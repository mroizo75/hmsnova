import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import initSocket from '@/lib/socket'

export function middleware(request: NextRequest) {
  // Initialiser socket.io hvis det er en socketio-forespørsel
  if (request.nextUrl.pathname.startsWith('/api/socketio')) {
    const res = NextResponse.next()
    initSocket((res as any).socket?.server)
    return res
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/socketio/:path*'
} 