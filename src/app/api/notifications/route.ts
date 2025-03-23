import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { NextResponse } from "next/server"
import prisma from "@/lib/db"

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

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    console.log("GET Notifications API: Session data:", 
      session ? { 
        userId: session.user?.id,
        role: session.user?.role,
        loggedIn: !!session.user 
      } : "Ingen sesjon")
    
    if (!session?.user) {
      console.log("GET Notifications API: Ingen gyldig brukersesjon")
      
      // For testing: Returner en tom liste istedenfor feil
      return NextResponse.json([], { 
        headers: corsHeaders 
      })
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10 // Begrens til de 10 siste varslene
    })

    console.log(`GET Notifications API: Fant ${notifications.length} varsler for bruker ${session.user.id}`)
    
    return NextResponse.json(notifications, { 
      headers: corsHeaders 
    })
  } catch (error) {
    console.error("GET Notifications API: Feil ved henting av varsler:", error)
    return NextResponse.json(
      { error: "Kunne ikke hente varsler" },
      { 
        status: 500,
        headers: corsHeaders 
      }
    )
  }
} 