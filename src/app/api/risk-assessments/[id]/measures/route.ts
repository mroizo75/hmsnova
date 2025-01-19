import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { z } from "zod"

const createMeasureSchema = z.object({
  description: z.string().min(10),
  type: z.enum(["ELIMINATION", "SUBSTITUTION", "ENGINEERING", "ADMINISTRATIVE", "PPE"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  deadline: z.string().optional(),
  responsibleId: z.string().optional()
})

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(
  request: Request,
  context: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const { id } = await context.params

    const measures = await prisma.riskAssessmentMeasure.findMany({
      where: {
        riskAssessmentId: id,
        riskAssessment: {
          companyId: session.user.companyId
        }
      },
      orderBy: {
        createdAt: 'desc'
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
    const body = await request.json()

    const validatedData = createMeasureSchema.parse(body)

    const measure = await prisma.riskAssessmentMeasure.create({
      data: {
        ...validatedData,
        riskAssessmentId: id,
        createdBy: session.user.id,
        status: 'OPEN'
      }
    })

    // Logg opprettelsen
    await prisma.auditLog.create({
      data: {
        action: "CREATE_RISK_ASSESSMENT_MEASURE",
        entityType: "RISK_ASSESSMENT_MEASURE",
        entityId: measure.id,
        userId: session.user.id,
        companyId: session.user.companyId,
        details: {
          description: validatedData.description,
          type: validatedData.type,
          priority: validatedData.priority
        }
      }
    })

    return NextResponse.json(measure)
  } catch (error) {
    console.error("Error creating measure:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Kunne ikke opprette tiltak" },
      { status: 500 }
    )
  }
} 