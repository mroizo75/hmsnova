import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { headers } from "next/headers"

// CORS-headers for enklere testing
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST() {
  try {
    // Hent headers for å støtte sesjonshåndtering
    const headersList = headers()
    
    // Bruk getServerSession for å hente brukerens sesjon
    const session = await getServerSession(authOptions)
    console.log("API: Session data:", 
      session ? { 
        userId: session.user?.id,
        role: session.user?.role,
        loggedIn: !!session.user 
      } : "Ingen sesjon")
    
    if (!session?.user?.id) {
      console.error('API: Ingen gyldig bruker-ID funnet for mark-all-read')
      
      // For test: Prøv å finne en standardbruker
      // I produksjon ville dette vært svært usikkert
      // Dette er bare for debugging
        // Fortsett med testbrukeren
        
      
      return NextResponse.json(
        { error: 'Ingen gyldig brukersesjon. Vennligst logg inn på nytt.' },
        { 
          status: 401,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      )
    }
    
    const userId = session.user.id
    console.log(`API: Markerer alle varsler som lest for bruker: ${userId}`)
    
    // Sjekk om brukeren har noen uleste varsler først
    const unreadCount = await prisma.notification.count({
      where: {
        userId: userId,
        read: false
      }
    })
    
    console.log(`API: Fant ${unreadCount} uleste varsler for bruker ${userId}`)
    
    if (unreadCount === 0) {
      return NextResponse.json({ 
        success: true,
        count: 0,
        message: "Ingen uleste varsler å markere"
      }, { headers: corsHeaders })
    }
    
    const result = await prisma.notification.updateMany({
      where: {
        userId: userId,
        read: false
      },
      data: {
        read: true,
        updatedAt: new Date()
      }
    })
    
    console.log(`API: Markerte ${result.count} varsler som lest`)
    
    return NextResponse.json({ 
      success: true,
      count: result.count
    }, { headers: corsHeaders })
  } catch (error) {
    console.error('API: Feil ved markering av alle varsler som lest:', error)
    return NextResponse.json(
      { error: 'Kunne ikke markere alle varsler som lest', details: error instanceof Error ? error.message : 'Ukjent feil' },
      { 
        status: 500,
        headers: corsHeaders
      }
    )
  }
} 