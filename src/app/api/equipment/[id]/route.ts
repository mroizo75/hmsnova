import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"

// GET /api/equipment/[id] - Hent spesifikt utstyr
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const equipment = await prisma.equipment.findUnique({
      where: {
        id: params.id,
        companyId: session.user.companyId
      },
      include: {
        deviations: {
          include: {
            measures: true
          }
        },
        inspections: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        documents: true
      }
    })

    if (!equipment) {
      return new NextResponse("Not Found", { status: 404 })
    }

    return NextResponse.json(equipment)
  } catch (error) {
    console.error('Error fetching equipment:', error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

// PATCH /api/equipment/[id] - Oppdater utstyr
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const data = await req.json()

    const equipment = await prisma.equipment.update({
      where: {
        id: params.id,
        companyId: session.user.companyId
      },
      data,
      include: {
        deviations: true,
        inspections: true
      }
    })

    return NextResponse.json(equipment)
  } catch (error) {
    console.error('Error updating equipment:', error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 