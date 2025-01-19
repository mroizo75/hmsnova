import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(
  request: Request,
  context: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params

    const changes = await prisma.hMSChange.findMany({
      where: {
        deviations: {
          some: {
            id: id
          }
        }
      },
      include: {
        company: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(changes)
  } catch (error) {
    console.error('Error fetching HMS changes:', error)
    return NextResponse.json(
      { error: "Kunne ikke hente HMS-endringer" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  context: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const data = await request.json()

    const change = await prisma.hMSChange.create({
      data: {
        title: data.title,
        description: data.description,
        changeType: data.type,
        status: data.status || 'PENDING',
        priority: data.priority || 'LOW',
        dueDate: data.dueDate,
        implementedAt: data.implementedAt,
        deviations: {
          create: {
            deviationId: id
          }
        },
        createdBy: session.user.id,
        companyId: session.user.companyId
      }
    })

    return NextResponse.json(change)
  } catch (error) {
    console.error('Error creating HMS change:', error)
    return NextResponse.json(
      { error: "Kunne ikke opprette HMS-endring" },
      { status: 500 }
    )
  }
} 