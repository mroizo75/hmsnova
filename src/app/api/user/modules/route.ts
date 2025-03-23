import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({
        error: "Uautentisert"
      }, { 
        status: 401,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache', 
          'Expires': '0'
        }
      })
    }

    // Hent brukerens bedrift
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        companyId: true,
        company: {
          select: {
            modules: true
          }
        }
      }
    })
    
    if (!user || !user.companyId) {
      return NextResponse.json({
        error: "Bruker har ikke tilgang til bedriftsmoduler"
      }, { 
        status: 403,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache', 
          'Expires': '0'
        }
      })
    }

    // Standardmoduler - sikrer at navigasjonen viser riktige elementer
    // selv om modulene ikke er eksplisitt definert i databasen
    const standardModules = [
      "HMS_HANDBOOK",
      "DEVIATIONS",
      "RISK_ASSESSMENT",
      "DOCUMENTS", 
      "CHEMICAL_INVENTORY",
      "SAFETY_ROUNDS"
    ]
    
    // Finn aktive moduler fra databasen
    const activeDBModules = user.company.modules.filter(m => m.isActive).map(m => m.key)
    
    // Sammenslå standard og faktiske moduler
    const activeModules = [...new Set([...standardModules, ...activeDBModules])]
    
    // Formater responsen
    const formattedModules = activeModules.map(key => ({
      key,
      isActive: true
    }))

    // Returner aktive moduler
    return NextResponse.json({
      modules: formattedModules
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache', 
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error("Feil ved henting av moduler:", error)
    return NextResponse.json({
      error: "Intern serverfeil"
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache', 
        'Expires': '0'
      }
    })
  }
} 