import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"

// GET /api/equipment/inspections - Hent alle inspeksjoner med filtrering
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    const where = {
      equipment: {
        companyId: session.user.companyId
      },
      AND: [] as any[]
    }

    if (search) {
      where.AND.push({
        OR: [
          { equipment: { name: { contains: search, mode: 'insensitive' } } },
          { findings: { contains: search, mode: 'insensitive' } }
        ]
      })
    }

    if (type) {
      where.AND.push({ type })
    }

    if (status) {
      where.AND.push({ status })
    }

    if (dateFrom || dateTo) {
      where.AND.push({
        createdAt: {
          ...(dateFrom && { gte: new Date(dateFrom) }),
          ...(dateTo && { lte: new Date(dateTo) })
        }
      })
    }

    if (where.AND.length === 0) {
      delete where.AND
    }

    const inspections = await prisma.equipmentInspection.findMany({
      where,
      include: {
        equipment: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(inspections)
  } catch (error) {
    console.error('Error fetching inspections:', error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 