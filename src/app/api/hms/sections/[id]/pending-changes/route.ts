import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const pendingChanges = await prisma.hMSChange.findMany({
      where: {
        sectionId: params.id,
        status: "PLANNED",
        companyId: session.user.companyId
      },
      include: {
        deviations: {
          include: {
            deviation: {
              select: {
                id: true,
                title: true
              }
            }
          }
        },
        riskAssessments: {
          include: {
            riskAssessment: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(pendingChanges)
  } catch (error) {
    console.error("Error fetching pending changes:", error)
    return NextResponse.json(
      { error: "Kunne ikke hente ventende endringer" },
      { status: 500 }
    )
  }
} 