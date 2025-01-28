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
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    
    const measure = await prisma.riskAssessmentMeasure.create({
      data: {
        description: body.description,
        type: body.type,
        priority: body.priority,
        status: body.status,
        riskAssessmentId: params.id,
        createdBy: session.user.id
      }
    })

    return NextResponse.json(measure)
  } catch (error) {
    console.error("[RISK_ASSESSMENT_MEASURES_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 