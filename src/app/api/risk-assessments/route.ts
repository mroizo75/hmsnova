import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { NextResponse } from "next/server"
import { serialize } from "@/lib/utils/serializers"

export const dynamic = 'force-dynamic' // Force dynamisk generering hver gang

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Logg for debugging
    console.log(`[RISK_ASSESSMENTS_GET] Henter alle risikovurderinger, timestamp: ${Date.now()}`)

    const riskAssessments = await prisma.riskAssessment.findMany({
      where: {
        companyId: session.user.companyId
      },
      include: {
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
        equipment: true,
        HMSSection: true
      }
    })

    // Legg til metadata for sporing
    const responseData = {
      items: riskAssessments,
      _metadata: {
        count: riskAssessments.length,
        timestamp: Date.now(),
        generatedAt: new Date().toISOString()
      }
    }

    // Bruk serialisering for å sikre at data er klar for JSON
    const serializedData = serialize(responseData);

    // Returner med standard headers
    return NextResponse.json(serializedData)
  } catch (error) {
    console.error("[RISK_ASSESSMENTS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const data = await req.json()
    
    const assessment = await prisma.riskAssessment.create({
      data: {
        title: data.title,
        description: data.description,
        department: data.department,
        activity: data.activity,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        companyId: session.user.companyId,
        createdBy: session.user.id,
        // Bruk equipmentId direkte hvis det er en utstyrsvurdering
        equipmentId: data.isEquipmentAssessment ? data.equipmentId : null
      }
    })

    // Serialiser før respons
    return NextResponse.json(serialize(assessment))
  } catch (error) {
    console.error("Error creating risk assessment:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 