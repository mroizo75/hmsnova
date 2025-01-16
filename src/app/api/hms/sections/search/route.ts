import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"

export async function GET(request: NextRequest) {
  let debugInfo = {
    step: '1. API kall mottatt',
    error: null as any
  }
  
  try {
    const session = await getServerSession(authOptions)
    debugInfo.step = '2. Session hentet'

    if (!session?.user?.id) {
      return new Response(
        JSON.stringify({ error: "Ikke autorisert" }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const query = request.nextUrl.searchParams.get('q')
    debugInfo.step = '3. Query hentet: ' + query

    if (!query || query.trim().length < 2) {
      return new Response(
        JSON.stringify({ sections: [] }), 
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Finn handbook
    debugInfo.step = '4. Søker handbook'
    const handbook = await prisma.hMSHandbook.findFirst({
      where: {
        companyId: session.user.companyId
      },
      select: {
        id: true
      }
    })

    if (!handbook?.id) {
      return new Response(
        JSON.stringify({ 
          sections: [],
          message: "Ingen handbook funnet" 
        }), 
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Søk i seksjoner
    debugInfo.step = '5. Søker seksjoner'
    const searchTerm = query.trim().toLowerCase()
    const sections = await prisma.hMSSection.findMany({
      where: {
        handbookId: handbook.id,
        OR: [
          { 
            title: { 
              search: searchTerm
            } 
          },
          { 
            content: { 
              search: searchTerm
            } 
          }
        ]
      },
      select: {
        id: true,
        title: true
      },
      orderBy: {
        title: 'asc'
      }
    })

    debugInfo.step = '6. Sender respons'
    return new Response(
      JSON.stringify({ 
        success: true,
        sections,
        count: sections.length 
      }), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    debugInfo.error = {
      message: error instanceof Error ? error.message : 'Ukjent feil',
      step: debugInfo.step
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: "Kunne ikke utføre søk",
        details: error instanceof Error ? error.message : 'Ukjent feil',
        debug: debugInfo
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
} 