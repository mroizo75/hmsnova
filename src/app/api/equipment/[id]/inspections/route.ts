import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"

// GET /api/equipment/[id]/inspections - Hent inspeksjoner for spesifikt utstyr
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const inspections = await prisma.equipmentInspection.findMany({
      where: {
        equipmentId: params.id,
        equipment: {
          companyId: session.user.companyId
        }
      },
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

// POST /api/equipment/[id]/inspections - Opprett ny inspeksjon
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()

    const inspection = await prisma.equipmentInspection.create({
      data: {
        equipmentId: params.id,
        type: body.type,
        status: body.status,
        findings: body.findings,
        nextInspection: body.nextInspection,
        comments: body.comments,
        inspectorId: session.user.id,
        companyId: session.user.companyId,
      },
      include: {
        equipment: true,
        inspector: true,
      }
    })

    return NextResponse.json(inspection)
  } catch (error) {
    console.error('Error creating inspection:', error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 