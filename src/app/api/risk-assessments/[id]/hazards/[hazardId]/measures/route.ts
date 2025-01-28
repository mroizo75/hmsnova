import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"

export async function POST(
  request: Request,
  { params }: { params: { id: string; hazardId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    const { description, type, priority, status } = body

    const measure = await prisma.riskAssessmentMeasure.create({
      data: {
        description,
        type,
        priority,
        status,
        hazardId: params.hazardId,
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

export async function GET(
  request: Request,
  { params }: { params: { id: string; hazardId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const measures = await prisma.riskAssessmentMeasure.findMany({
      where: {
        riskAssessmentId: params.id,
        hazardId: params.hazardId
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(measures)
  } catch (error) {
    console.error("[RISK_ASSESSMENT_MEASURES_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 