import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(
  request: Request,
  context: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const { id } = await context.params
    const { changeId } = await request.json()

    // Sjekk om endringen eksisterer
    const change = await prisma.hMSChange.findUnique({
      where: { 
        id: changeId,
        companyId: session.user.companyId
      }
    })

    if (!change) {
      return NextResponse.json({ error: "Endring ikke funnet" }, { status: 404 })
    }

    // Koble endringen til risikovurderingen
    const linkedChange = await prisma.riskAssessmentHMSChange.create({
      data: {
        riskAssessmentId: id,
        hmsChangeId: changeId,
      }
    })

    // Logg koblingen
    await prisma.auditLog.create({
      data: {
        action: "LINK_HMS_CHANGE",
        entityType: "RISK_ASSESSMENT",
        entityId: id,
        userId: session.user.id,
        companyId: session.user.companyId,
        details: {
          changeId,
          changeTitle: change.title
        }
      }
    })

    return NextResponse.json(linkedChange)
  } catch (error) {
    console.error("Error linking HMS change:", error)
    return NextResponse.json(
      { error: "Kunne ikke koble HMS-endring" },
      { status: 500 }
    )
  }
} 