import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/utils/auth"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth()
    const handbookId = params.id

    const releases = await prisma.hMSRelease.findMany({
      where: {
        handbookId: handbookId,
        handbook: {
          companyId: session.user.companyId
        }
      },
      include: {
        handbook: {
          include: {
            sections: {
              include: {
                changes: true
              }
            }
          }
        }
      },
      orderBy: {
        version: 'desc'
      }
    })

    // Hent brukerinfo for hver release
    const releasesWithUserInfo = await Promise.all(
      releases.map(async (release) => {
        const approver = await prisma.user.findUnique({
          where: { id: release.approvedBy },
          select: { name: true }
        })

        return {
          ...release,
          approvedBy: approver?.name || 'Ukjent bruker'
        }
      })
    )

    // Map endringer for hver release
    const mappedReleases = releasesWithUserInfo.map(release => ({
      id: release.id,
      version: release.version,
      changes: release.changes,
      reason: release.reason,
      approvedBy: release.approvedBy,
      approvedAt: release.approvedAt,
      createdAt: release.createdAt,
      hmsChanges: release.handbook.sections.flatMap(section => section.changes)
    }))

    return NextResponse.json(mappedReleases)
  } catch (error) {
    console.error("Error fetching releases:", error)
    return NextResponse.json(
      { error: "Kunne ikke hente versjonshistorikk" },
      { status: 500 }
    )
  }
} 