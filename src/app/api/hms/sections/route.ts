import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    console.log("1. Starting GET sections request")
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log("2. No session found")
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    console.log("3. Session found:", { userId: session.user.id, companyId: session.user.companyId })

    const sections = await prisma.hMSSection.findMany({
      where: {
        handbook: {
          companyId: session.user.companyId
        }
      },
      select: {
        id: true,
        title: true
      },
      orderBy: {
        order: 'asc'
      }
    })

    console.log("4. Found sections:", JSON.stringify(sections, null, 2))

    return NextResponse.json(sections)
  } catch (error) {
    console.error("5. Error in GET sections:", error)
    return NextResponse.json(
      { error: "Kunne ikke hente seksjoner", details: error instanceof Error ? error.message : "Ukjent feil" },
      { status: 500 }
    )
  }
} 