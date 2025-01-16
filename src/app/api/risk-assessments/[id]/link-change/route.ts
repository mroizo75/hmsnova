import { NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/lib/db"
import { requireAuth } from "@/lib/utils/auth"

const linkChangeSchema = z.object({
  hazardIds: z.array(z.string()).min(1),
  changeId: z.string()
})

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth()
    const body = await req.json()
    
    const validatedData = linkChangeSchema.parse(body)
    const riskAssessmentId = params.id

    // Opprett koblinger mellom farer og HMS-endring
    await Promise.all(
      validatedData.hazardIds.map(hazardId =>
        prisma.hazardHMSChange.create({
          data: {
            hazardId,
            hmsChangeId: validatedData.changeId
          }
        })
      )
    )

    // Koble risikovurderingen til HMS-endringen
    await prisma.riskAssessmentHMSChange.create({
      data: {
        riskAssessmentId,
        hmsChangeId: validatedData.changeId
      }
    })

    // Logg handlingen
    await prisma.auditLog.create({
      data: {
        action: "LINK_HMS_CHANGE",
        entityType: "RISK_ASSESSMENT",
        entityId: riskAssessmentId,
        userId: session.user.id,
        companyId: session.user.companyId,
        details: {
          hazardIds: validatedData.hazardIds,
          changeId: validatedData.changeId
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error linking HMS change:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 