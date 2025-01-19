import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { requireAuth } from "@/lib/utils/auth"

export async function GET(request: Request) {
  try {
    const session = await requireAuth()

    const sections = await prisma.hMSSection.findMany({
      where: {
        handbook: {
          companyId: session.user.companyId
        }
      },
      include: {
        subsections: {
          orderBy: {
            order: 'asc'
          }
        },
        changes: {
          where: {
            status: {
              in: ['OPEN', 'IN_PROGRESS', 'ASSIGNED']
            }
          },
        },
      },
      orderBy: {
        order: 'asc'
      }
    })

    return NextResponse.json(sections)
  } catch (error) {
    console.error("Error fetching sections with content:", error)
    return NextResponse.json(
      { error: "Kunne ikke hente seksjoner med innhold" },
      { status: 500 }
    )
  }
} 