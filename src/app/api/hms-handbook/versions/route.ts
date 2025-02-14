import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.companyId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Hent alle publiserte versjoner av HMS-håndboken for dette selskapet
    const versions = await prisma.hMSHandbook.findMany({
      where: {
        companyId: session.user.companyId,
        publishedAt: {
          not: null
        },
        status: 'ACTIVE'
      },
      orderBy: {
        version: 'desc'
      },
      select: {
        id: true,
        version: true,
        title: true,
        publishedAt: true,
        publishedBy: true,
        sections: {
          select: {
            id: true,
            title: true,
            content: true,
            order: true,
            subsections: {
              select: {
                id: true,
                title: true,
                content: true,
                order: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(versions)
  } catch (error) {
    console.error('Error fetching HMS handbook versions:', error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 