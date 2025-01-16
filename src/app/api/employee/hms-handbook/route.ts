import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const handbook = await prisma.hMSHandbook.findFirst({
      where: {
        companyId: session.user.companyId,
        published: true  // Hent kun publiserte håndbøker
      },
      include: {
        sections: {
          orderBy: {
            order: 'asc'
          },
          include: {
            subsections: {
              orderBy: {
                order: 'asc'
              }
            }
          }
        }
      }
    })

    if (!handbook) {
      return NextResponse.json({ error: "Ingen aktiv HMS-håndbok funnet" }, { status: 404 })
    }

    return NextResponse.json(handbook)
  } catch (error) {
    console.error("Error fetching handbook:", error)
    return NextResponse.json({ 
      error: "Kunne ikke hente HMS-håndbok",
      details: error instanceof Error ? error.message : 'Ukjent feil'
    }, { 
      status: 500 
    })
  }
} 