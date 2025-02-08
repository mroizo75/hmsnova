import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'SUPPORT'].includes(session.user.role)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Hent bedrifter som har vernerunde-modulen aktivert
    const companies = await prisma.company.findMany({
      where: {
        modules: {
          some: {
            key: 'SAFETY_ROUNDS',
            isActive: true
          }
        }
      },
      select: {
        id: true,
        name: true,
        modules: {
          where: {
            key: 'SAFETY_ROUNDS'
          },
          select: {
            id: true,
            key: true,
            label: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(companies)
  } catch (error) {
    console.error('Error fetching companies:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 