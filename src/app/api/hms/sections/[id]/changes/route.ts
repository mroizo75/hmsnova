import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { requireAuth } from "@/lib/utils/auth"
import { z } from "zod"

const createChangeSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  type: z.enum(["CORRECTION", "IMPROVEMENT", "PREVENTIVE"])
})

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

    const changes = await prisma.hMSChange.findMany({
      where: {
        sectionId: id,
        companyId: session.user.companyId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(changes)
  } catch (error) {
    console.error("Error fetching HMS changes:", error)
    return NextResponse.json(
      { error: "Kunne ikke hente HMS-endringer" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  context: RouteParams
) {
  try {
    const session = await requireAuth()
    const body = await request.json()
    
    const validatedData = createChangeSchema.parse(body)
    const { id: sectionId } = await context.params

    const change = await prisma.hMSChange.create({
      data: {
        ...validatedData,
        sectionId,
        companyId: session.user.companyId,
        priority: validatedData.priority,
        createdAt: new Date(),
        updatedAt: new Date(),
        implementedAt: new Date(),
        dueDate: new Date(),
        changeType: validatedData.type,
        createdBy: session.user.id,
        status: 'OPEN'
      }
    })

    // Logg opprettelsen
    await prisma.auditLog.create({
      data: {
        action: "CREATE_HMS_CHANGE",
        entityType: "HMS_CHANGE",
        entityId: change.id,
        userId: session.user.id,
        companyId: session.user.companyId,
        details: {
          title: validatedData.title,
          type: validatedData.type,
          priority: validatedData.priority
        }
      }
    })

    return NextResponse.json(change)
  } catch (error) {
    console.error("Error creating HMS change:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Kunne ikke opprette HMS-endring" },
      { status: 500 }
    )
  }
} 