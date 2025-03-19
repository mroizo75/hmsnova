import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { serialize } from "@/lib/utils/serializers"

// Bruk standard Next.js caching-direktiver
export const dynamic = 'force-dynamic' // Force dynamisk generering hver gang

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Vent på params først
    const { id } = await params
    
    // Logg for debugging
    console.log(`[RISK_ASSESSMENT_GET] Henter risikovurdering ID: ${id}, timestamp: ${Date.now()}`)

    const riskAssessment = await prisma.riskAssessment.findFirst({
      where: {
        id: id,
        companyId: session.user.companyId
      },
      include: {
        equipment: true,
        hazards: {
          include: {
            riskMeasures: true,
            hmsChanges: {
              include: {
                hmsChange: true
              }
            }
          }
        },
        hmsChanges: {
          include: {
            hmsChange: true
          }
        },
        HMSSection: true
      }
    })

    if (!riskAssessment) {
      return new NextResponse("Risk assessment not found", { status: 404 })
    }

    // Legg til metadata for sporing
    const responseData = {
      ...riskAssessment,
      _metadata: {
        timestamp: Date.now(),
        generatedAt: new Date().toISOString()
      }
    }

    // Serialiser data før respons
    const serializedData = serialize(responseData);

    // Returner med standard headers
    return NextResponse.json(serializedData)
  } catch (error) {
    console.error("[RISK_ASSESSMENT_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 