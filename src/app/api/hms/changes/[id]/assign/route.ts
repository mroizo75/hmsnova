import { NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/lib/db"
import { requireAuth } from "@/lib/utils/auth"

const assignSchema = z.object({
  assignedToId: z.string().min(1),
  comment: z.string().optional()
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
    
    const validatedData = assignSchema.parse(body)
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

    // Oppdater tilordningen
    const updatedChange = await prisma.hMSChange.update({
      where: { id },
      data: {
        assignedTo: validatedData.assignedToId,
        status: 'ASSIGNED'
      }
    })

    // Logg tilordningen
    await prisma.auditLog.create({
      data: {
        action: "ASSIGN_HMS_CHANGE",
        entityType: "HMS_CHANGE",
        entityId: id,
        userId: session.user.id,
        companyId: session.user.companyId,
        details: {
          assignedToId: validatedData.assignedToId,
          comment: validatedData.comment
        }
      }
    })

    return NextResponse.json(updatedChange)
  } catch (error) {
    console.error("Error assigning HMS change:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Kunne ikke tilordne HMS-endring" },
      { status: 500 }
    )
  }
} 