import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const riskAssessment = await prisma.riskAssessment.findFirst({
      where: {
        id: params.id,
        companyId: session.user.companyId
      },
      include: {
        hazards: {
          include: {
            measures: true,
            hmsChanges: {
              include: {
                hmsChange: true
              }
            }
          }
        },
        measures: true,
        relatedHMSSections: true,
        hmsChanges: {
          include: {
            hmsChange: true
          }
        }
      }
    })

    if (!riskAssessment) {
      return new NextResponse("Risk assessment not found", { status: 404 })
    }

    return NextResponse.json(riskAssessment)
  } catch (error) {
    console.error("[RISK_ASSESSMENT_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 