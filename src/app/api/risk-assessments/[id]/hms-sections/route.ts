import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { suggestHMSSections } from "@/lib/utils/hms-suggestions"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const riskAssessment = await prisma.riskAssessment.findUnique({
      where: { id: params.id },
      include: {
        relatedHMSSections: true,
        hmsChanges: {
          include: {
            hmsChange: true
          }
        }
      }
    })

    if (!riskAssessment) {
      return NextResponse.json({ error: "Ikke funnet" }, { status: 404 })
    }

    // Foreslå relevante seksjoner
    const suggestions = await suggestHMSSections(riskAssessment)

    return NextResponse.json({
      current: riskAssessment.relatedHMSSections,
      suggestions
    })
  } catch (error) {
    console.error("Error fetching HMS sections:", error)
    return NextResponse.json(
      { error: "Kunne ikke hente HMS-seksjoner" },
      { status: 500 }
    )
  }
} 