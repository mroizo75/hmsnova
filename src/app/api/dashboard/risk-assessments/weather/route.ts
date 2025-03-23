import { NextRequest, NextResponse } from "next/server"

// Bruk standard Next.js caching-direktiver
export const dynamic = 'force-dynamic' // Force dynamisk generering hver gang

/**
 * API-rute for å hente værdata - videresender til hovedendepunktet
 * Dette endepunktet er for bakoverkompatibilitet og redirecter til /api/weather
 */
export async function GET(req: NextRequest) {
  try {
    // Hent ut søkeparametre
    const { searchParams } = new URL(req.url)
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')
    const timestamp = searchParams.get('t') || Date.now()
    
    // Bygg ny URL til hovedendepunktet
    const redirectUrl = `/api/weather?lat=${lat}&lon=${lon}&t=${timestamp}`
    
    // Logg for debugging
    console.log(`[API Redirect] Videresender værforespørsel til: ${redirectUrl}`)
    
    // Gjør en server-side request til hovedendepunktet
    const response = await fetch(new URL(redirectUrl, req.nextUrl.origin), {
      method: 'GET',
      headers: {
        // Videresend autorisasjonsheader fra original request
        ...req.headers
      },
      cache: 'no-store'
    })
    
    // Returner responsen fra hovedendepunktet
    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error: any) {
    console.error('Feil ved videresending av værforespørsel:', error)
    return new NextResponse(JSON.stringify({ 
      error: "Kunne ikke hente værdata", 
      details: error?.message || 'Ukjent feil',
      note: "Dette er et legacy-endepunkt, bruk /api/weather direkte i stedet"
    }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
} 