import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
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
    let where: any = {
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

    // Hvis ingen AND-betingelser, lag nytt where-objekt uten AND
    if (where.AND.length === 0) {
      where = {
        companyId: session.user.companyId
      }
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
    
    // Valider påkrevde felt
    const requiredFields = ['name', 'type', 'category', 'serialNumber', 'location']
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { message: `Felt ${field} er påkrevd` },
          { status: 400 }
        )
      }
    }
    
    // Konverter datoer hvis de er strenger
    if (data.purchaseDate && typeof data.purchaseDate === 'string') {
      data.purchaseDate = new Date(data.purchaseDate)
    }
    
    if (data.nextInspection && typeof data.nextInspection === 'string') {
      data.nextInspection = new Date(data.nextInspection)
    }
    
    // Opprett utstyr med korrekte felter
    const equipment = await prisma.equipment.create({
      data: {
        name: data.name,
        type: data.type,
        category: data.category,
        serialNumber: data.serialNumber,
        location: data.location,
        description: data.description || null,
        manufacturer: data.manufacturer || null,
        model: data.model || null,
        purchaseDate: data.purchaseDate || null,
        nextInspection: data.nextInspection || null,
        notes: data.notes || null,
        status: data.status || 'ACTIVE',
        companyId: session.user.companyId
      },
      include: {
        deviations: true,
        inspections: true
      }
    })
    
    // Send socket.io-oppdatering hvis tilgjengelig
    try {
      const { getIO } = await import('@/lib/socket/store')
      const io = getIO()
      if (io) {
        io.to(`company-${session.user.companyId}`).emit('equipment:created', {
          id: equipment.id,
          name: equipment.name
        })
      }
    } catch (error) {
      console.error('Socket.io-feil ved utstyrsopprettelse:', error)
    }

    return NextResponse.json(equipment)
  } catch (error) {
    console.error('Error creating equipment:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { message: `Feil ved opprettelse av utstyr: ${error.message}` },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { message: "Intern serverfeil" },
      { status: 500 }
    )
  }
} 