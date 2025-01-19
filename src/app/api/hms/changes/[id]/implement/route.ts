import { NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/lib/db"
import { requireAuth } from "@/lib/utils/auth"

const implementSchema = z.object({
  comment: z.string().min(10),
  implementationDetails: z.string().optional()
})

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(
  request: Request,
  context: RouteParams
) {
  try {
    const session = await requireAuth()
    const body = await request.json()
    
    const validatedData = implementSchema.parse(body)
    const { id } = await context.params

    // Sjekk om endringen eksisterer og tilhører riktig bedrift
    const change = await prisma.hMSChange.findUnique({
      where: {
        id,
        companyId: session.user.companyId
      }
    })

    if (!change) {
      return NextResponse.json({ error: "HMS-endring ikke funnet" }, { status: 404 })
    }

    // Oppdater implementeringen
    const updatedChange = await prisma.hMSChange.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        implementedAt: new Date()
      }
    })

    // Logg implementeringen
    await prisma.auditLog.create({
      data: {
        action: "IMPLEMENT_HMS_CHANGE",
        entityType: "HMS_CHANGE",
        entityId: id,
        userId: session.user.id,
        companyId: session.user.companyId,
        details: {
          comment: validatedData.comment,
          implementationDetails: validatedData.implementationDetails
        }
      }
    })

    return NextResponse.json(updatedChange)
  } catch (error) {
    console.error("Error implementing HMS change:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Kunne ikke implementere HMS-endring" },
      { status: 500 }
    )
  }
} 