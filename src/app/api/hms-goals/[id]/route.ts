import { NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/lib/db"
import { requireAuth } from "@/lib/utils/auth"
import { GoalStatus } from "@prisma/client"

const updateGoalSchema = z.object({
  description: z.string().min(10),
  year: z.number(),
  status: z.enum(["IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional()
})

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(
  request: Request,
  context: RouteParams
) {
  try {
    const session = await requireAuth()
    const body = await request.json()
    
    const validatedData = updateGoalSchema.parse(body)
    const { id } = await context.params

    const goal = await prisma.hMSGoal.update({
      where: {
        id,
        companyId: session.user.companyId
      },
      data: {
        description: validatedData.description,
        year: validatedData.year,
        status: validatedData.status as GoalStatus,
        updatedAt: new Date()
      }
    })

    // Logg oppdateringen
    await prisma.auditLog.create({
      data: {
        action: "UPDATE_HMS_GOAL",
        entityType: "HMS_GOAL",
        entityId: id,
        userId: session.user.id,
        companyId: session.user.companyId,
        details: validatedData
      }
    })

    return NextResponse.json(goal)
  } catch (error) {
    console.error("Error updating HMS goal:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function GET(
  request: Request,
  context: RouteParams
) {
  try {
    const session = await requireAuth()
    const { id } = await context.params

    const goal = await prisma.hMSGoal.findUnique({
      where: {
        id,
        companyId: session.user.companyId
      },
    })

    if (!goal) {
      return NextResponse.json({ error: "HMS mål ikke funnet" }, { status: 404 })
    }

    return NextResponse.json(goal)
  } catch (error) {
    console.error("Error fetching HMS goal:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 