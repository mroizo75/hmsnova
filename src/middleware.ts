import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Liste over offentlige stier som ikke krever autentisering
const publicPaths = [
  '/',
  '/login',
  '/register',
  '/omoss',
  '/team',
  '/karriere',
  '/hms-handbok',
  '/avvikshandtering',
  '/risikovurdering',
  '/sikkerjobbanalyse',
  '/stoffkartotek',
  '/vernerunde',
  '/kompetanse',
  '/priser',
  '/kontakt',
  '/tjenester',
  '/personvern',
  '/terms',
  '/cookies',
  '/forgot-password',
  '/reset-password'
]

// Sjekk om nåværende sti er i listen over offentlige stier eller i frontend-gruppen
function isPublicPath(pathname: string) {
  // Sjekk direkte mot publicPaths
  if (publicPaths.some(path => pathname === path || pathname.startsWith(`${path}/`))) {
    return true
  }
  
  // Sjekk om stien er i frontend-gruppen (alle sider som presenteres offentlig)
  if (pathname.startsWith('/(frontend)') || pathname.includes('/frontend/')) {
    return true
  }
  
  return false
}

// Sjekk om URL'en er en statisk fil eller API
function isStaticOrApiPath(pathname: string) {
  return pathname.startsWith('/_next') || 
         pathname.startsWith('/api/') ||
         pathname.includes('.')
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Logg for debugging - kan fjernes i produksjon
  console.log(`Middleware sjekker sti: ${pathname}`)

  // Sjekk om det er en offentlig sti eller statisk fil/api
  if (isPublicPath(pathname) || isStaticOrApiPath(pathname)) {
    return NextResponse.next()
  }

  try {
    // Sjekk om brukeren er autentisert for beskyttede ruter
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    
    // Logger token-data for feilsøking
    console.log(`Middleware: Token for ${pathname}:`, JSON.stringify({
      exists: !!token,
      role: token?.role || 'ingen',
      path: pathname
    }))
    
    // Ingen token for beskyttet rute
    if (!token) {
      const url = new URL('/login', request.url)
      url.searchParams.set('callbackUrl', encodeURI(request.url))
      url.searchParams.set('error', 'SessionExpired')
      return NextResponse.redirect(url)
    }

    // Valider rolletilgang basert på sti
    const role = token.role as string || ''
    console.log(`Middleware: Validerer tilgang for rolle ${role} til sti ${pathname}`);
    
    // Admin-ruter krever ADMIN eller SUPPORT-rolle
    if (pathname.includes('/admin/') && role !== 'ADMIN' && role !== 'SUPPORT') {
      console.log(`Unauthorized access to admin route: ${pathname} by role: ${role}`)
      const url = new URL('/login', request.url)
      url.searchParams.set('error', 'UnauthorizedAccess')
      return NextResponse.redirect(url)
    }
    
    // Employee-ruter krever EMPLOYEE-rolle (eller admin-rolle)
    if (pathname.includes('/employee/') && role !== 'EMPLOYEE' && role !== 'ADMIN' && role !== 'SUPPORT') {
      console.log(`Unauthorized access to employee route: ${pathname} by role: ${role}`)
      const url = new URL('/login', request.url)
      url.searchParams.set('error', 'UnauthorizedAccess')
      return NextResponse.redirect(url)
    }
    
    // Sjekk om brukeren er ADMIN/SUPPORT på et vanlig /dashboard
    if (pathname === '/dashboard' && (role === 'ADMIN' || role === 'SUPPORT')) {
      console.log(`ADMIN/SUPPORT bruker prøver å nå vanlig dashboard - omdirigerer til admin/dashboard`);
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    
    // FJERNER ALLE OMDIRIGERINGER MELLOM DASHBOARDS - DETTE SKAPER LØKKER
    // La hver side håndtere sin egen tilgangskontroll
    
    // Sjekk om token er i ferd med å utløpe (mindre enn 30 minutter igjen)
    const currentTime = Math.floor(Date.now() / 1000)
    const tokenExpires = token.exp as number || 0
    const THIRTY_MINUTES = 30 * 60
    
    // Hvis tokenet utløper snart, legg til en header som kan trigge fornyelse på klientsiden
    if (tokenExpires && (tokenExpires - currentTime) < THIRTY_MINUTES) {
      const response = NextResponse.next()
      response.headers.set('X-Auth-Token-Expiring', 'true')
      return response
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Middleware authentication error:', error)
    
    // Ved autentiseringsfeil, omdiriger til login
    const url = new URL('/login', request.url)
    url.searchParams.set('callbackUrl', encodeURI(request.url))
    url.searchParams.set('error', 'AuthError')
    return NextResponse.redirect(url)
  }
}

export const config = {
  matcher: [
    /*
     * Matcher alle stier unntatt:
     * - API-ruter
     * - Statiske filer (bilder, js, css, osv.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|apple-touch-icon.png|apple-touch-icon-precomposed.png|apple-touch-icon-120x120.png|apple-touch-icon-152x152.png|apple-touch-icon-180x180.png|apple-touch-icon-192x192.png|apple-touch-icon-57x57.png|apple-touch-icon-72x72.png|apple-touch-icon-76x76.png|apple-touch-icon-114x114.png|apple-touch-icon-120x120.png|apple-touch-icon-144x144.png|apple-touch-icon-152x152.png|apple-touch-icon-180x180.png|apple-touch-icon-192x192.png).*)',
  ],
} 