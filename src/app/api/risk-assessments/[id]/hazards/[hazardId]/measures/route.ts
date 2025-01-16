import { NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/lib/db"
import { requireAuth } from "@/lib/utils/auth"

const createMeasureSchema = z.object({
  description: z.string().min(10),
  type: z.enum(["ELIMINATION", "SUBSTITUTION", "ENGINEERING", "ADMINISTRATIVE", "PPE"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  dueDate: z.string().optional().nullable(),
  assignedTo: z.string().optional().nullable()
})

export async function POST(
  req: Request,
  { params }: { params: { id: string, hazardId: string } }
) {
  try {
    const session = await requireAuth()
    const body = await req.json()
    
    const validatedData = createMeasureSchema.parse(body)
    
    const measure = await prisma.riskAssessmentMeasure.create({
      data: {
        description: validatedData.description,
        type: validatedData.type,
        status: "OPEN",
        priority: validatedData.priority,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        assignedTo: validatedData.assignedTo,
        createdBy: session.user.id,
        riskAssessmentId: params.id,
        hazardId: params.hazardId
      }
    })

    return NextResponse.json({ data: measure })
  } catch (error) {
    console.error("Error creating measure:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Ugyldig input", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Kunne ikke opprette tiltak" },
      { status: 500 }
    )
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string, hazardId: string } }
) {
  try {
    const measures = await prisma.riskAssessmentMeasure.findMany({
      where: {
        riskAssessmentId: params.id,
        hazardId: params.hazardId
      }
    })

    return NextResponse.json(measures)
  } catch (error) {
    console.error("Error fetching measures:", error)
    return NextResponse.json(
      { error: "Kunne ikke hente tiltak" },
      { status: 500 }
    )
  }
} 