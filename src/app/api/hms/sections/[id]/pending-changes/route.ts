import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { requireAuth } from "@/lib/utils/auth"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(
  request: Request,
  context: RouteParams
) {
  try {
    const session = await requireAuth()
    const { id: sectionId } = await context.params

    const pendingChanges = await prisma.hMSChange.findMany({
      where: {
        companyId: session.user.companyId,
        OR: [
          {
            sectionId: sectionId
          },
          {
            status: "PLANNED",
            sectionId: null
          }
        ]
      },
      include: {
        measures: true,
        deviations: {
          include: {
            deviation: {
              select: {
                id: true,
                title: true,
                description: true,
                measures: {
                  select: {
                    id: true,
                    description: true,
                    type: true,
                    status: true
                  }
                }
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

export async function POST(
  request: Request,
  context: RouteParams
) {
  try {
    const session = await requireAuth()
    const { id: sectionId } = await context.params
    const { changeIds } = await request.json()

    // Oppdater endringene til å være tilknyttet seksjonen
    await prisma.hMSChange.updateMany({
      where: {
        id: {
          in: changeIds
        },
        companyId: session.user.companyId,
        status: "PLANNED"
      },
      data: {
        sectionId,
        status: "IN_PROGRESS"
      }
    })

    // Logg tilordningen
    await prisma.auditLog.create({
      data: {
        action: "ASSIGN_CHANGES_TO_SECTION",
        entityType: "HMS_SECTION",
        entityId: sectionId,
        userId: session.user.id,
        companyId: session.user.companyId,
        details: {
          changeIds,
          count: changeIds.length
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error assigning changes:", error)
    return NextResponse.json(
      { error: "Kunne ikke tilordne endringer" },
      { status: 500 }
    )
  }
} 