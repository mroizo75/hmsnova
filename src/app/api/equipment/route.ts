import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"

// GET /api/equipment - Hent alt utstyr med filtrering
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Hent søkeparametere fra URL
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const needsInspection = searchParams.get('needsInspection') === 'true'
    const hasDeviations = searchParams.get('hasDeviations') === 'true'

    // Bygg opp where-betingelser
    const where = {
      companyId: session.user.companyId,
      AND: [] as any[]
    }

    // Legg til søk på navn eller serienummer
    if (search) {
      where.AND.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { serialNumber: { contains: search, mode: 'insensitive' } },
          { location: { contains: search, mode: 'insensitive' } }
        ]
      })
    }

    // Filtrer på type
    if (type) {
      where.AND.push({ type })
    }

    // Filtrer på status
    if (status) {
      where.AND.push({ status })
    }

    // Filtrer på kategori
    if (category) {
      where.AND.push({ category })
    }

    // Filtrer på utstyr som trenger inspeksjon
    if (needsInspection) {
      where.AND.push({
        OR: [
          { nextInspection: { lte: new Date() } },
          { nextInspection: null }
        ]
      })
    }

    // Filtrer på utstyr med aktive avvik
    if (hasDeviations) {
      where.AND.push({
        deviations: {
          some: {
            status: {
              in: ['OPEN', 'IN_PROGRESS']
            }
          }
        }
      })
    }

    // Hvis ingen AND-betingelser, fjern AND-arrayet
    if (where.AND.length === 0) {
      delete where.AND
    }

    // Hent sorteringsparametere
    const sortField = searchParams.get('sortField') || 'updatedAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Valider sorteringsfelt for å unngå SQL-injection
    const validSortFields = ['name', 'type', 'status', 'updatedAt', 'lastInspection', 'nextInspection']
    const validatedSortField = validSortFields.includes(sortField) ? sortField : 'updatedAt'

    const equipment = await prisma.equipment.findMany({
      where,
      include: {
        deviations: {
          where: {
            status: {
              in: ['OPEN', 'IN_PROGRESS']
            }
          }
        },
        inspections: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        [validatedSortField]: sortOrder === 'asc' ? 'asc' : 'desc'
      }
    })

    return NextResponse.json(equipment)
  } catch (error) {
    console.error('Error fetching equipment:', error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

// POST /api/equipment - Opprett nytt utstyr
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const data = await req.json()

    const equipment = await prisma.equipment.create({
      data: {
        ...data,
        status: 'ACTIVE',
        companyId: session.user.companyId!
      },
      include: {
        deviations: true,
        inspections: true
      }
    })

    return NextResponse.json(equipment)
  } catch (error) {
    console.error('Error creating equipment:', error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 