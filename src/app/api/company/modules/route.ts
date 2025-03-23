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

    if (!session.user.companyId) {
      return NextResponse.json({
        error: "Bruker har ikke tilknytning til en bedrift"
      }, { 
        status: 403,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache', 
          'Expires': '0'
        }
      })
    }

    // Hent moduler for brukerens bedrift
    const modules = await prisma.module.findMany({
      where: {
        companyId: session.user.companyId
      },
      select: {
        id: true,
        key: true,
        label: true,
        isActive: true
      }
    })

    return NextResponse.json({
      modules
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache', 
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error("Feil ved henting av bedriftsmoduler:", error)
    return NextResponse.json({
      error: "Kunne ikke hente bedriftsmoduler"
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