import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    console.log("1. Starting GET pending changes request")
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log("2. No session found")
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    console.log("3. Fetching pending changes for company:", session.user.companyId)

    const changes = await prisma.hMSChange.findMany({
      where: {
        companyId: session.user.companyId,
        status: "PLANNED",
        sectionId: null,
      },
      include: {
        measures: {
          select: {
            id: true,
            description: true,
            type: true,
            status: true
          }
        },
        deviations: {
          include: {
            deviation: {
              select: {
                id: true,
                title: true,
                description: true
              }
            }
          }
        },
        riskAssessments: {
          include: {
            riskAssessment: {
              select: {
                id: true,
                title: true,
                description: true
              }
            }
          }
        }
      }
    })

    console.log("4. Found pending changes:", changes.length)
    console.log("5. Changes data:", JSON.stringify(changes, null, 2))

    return NextResponse.json(changes)
  } catch (error) {
    console.error("6. Error in GET pending changes:", error)
    return NextResponse.json(
      { error: "Kunne ikke hente ventende endringer" },
      { status: 500 }
    )
  }
} 