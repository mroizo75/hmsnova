import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { requireAuth } from "@/lib/utils/auth"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(
  request: Request,
  context: RouteParams
) {
  try {
    const session = await requireAuth()
    const { id } = await context.params

    // Hent alle utgivelser for håndboken
    const releases = await prisma.hMSRelease.findMany({
      where: {
        handbookId: id,
        handbook: {
          companyId: session.user.companyId
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!releases) {
      return NextResponse.json({ error: "Ingen utgivelser funnet" }, { status: 404 })
    }

    return NextResponse.json(releases)
  } catch (error) {
    console.error("Error fetching HMS handbook releases:", error)
    return NextResponse.json(
      { error: "Kunne ikke hente utgivelser" },
      { status: 500 }
    )
  }
} 