import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    // 1. Hent alle HMS-endringer for selskapet
    const allChanges = await prisma.hMSChange.findMany({
      where: {
        companyId: session.user.companyId,
      },
      include: {
        measures: true,
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
        section: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    // 2. Hent alle seksjoner
    const sections = await prisma.hMSSection.findMany({
      where: {
        handbook: {
          companyId: session.user.companyId
        }
      },
      select: {
        id: true,
        title: true
      }
    })

    // 3. Organiser data for debugging
    const debug = {
      company: {
        id: session.user.companyId
      },
      changes: {
        total: allChanges.length,
        withSection: allChanges.filter(c => c.sectionId).length,
        withoutSection: allChanges.filter(c => !c.sectionId).length,
        byStatus: {
          PLANNED: allChanges.filter(c => c.status === "PLANNED").length,
          IN_PROGRESS: allChanges.filter(c => c.status === "IN_PROGRESS").length,
          COMPLETED: allChanges.filter(c => c.status === "COMPLETED").length
        }
      },
      sections: {
        total: sections.length,
        list: sections
      },
      detailedChanges: allChanges.map(change => ({
        id: change.id,
        title: change.title,
        status: change.status,
        sectionId: change.sectionId,
        sectionTitle: change.section?.title,
        deviationCount: change.deviations.length,
        deviations: change.deviations.map(d => ({
          id: d.deviation.id,
          title: d.deviation.title
        })),
        measureCount: change.measures.length
      }))
    }

    return NextResponse.json(debug)
  } catch (error) {
    console.error("Debug error:", error)
    return NextResponse.json({ error: "Debug feilet" }, { status: 500 })
  }
} 