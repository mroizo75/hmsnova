import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const { id } = await context.params

    const versions = await prisma.document.findMany({
      where: {
        id: id
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(versions)
  } catch (error) {
    console.error("Feil ved henting av dokumentversjoner:", error)
    return NextResponse.json({
      error: "Kunne ikke hente dokumentversjoner",
      message: error instanceof Error ? error.message : 'Ukjent feil'
    }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()

    const version = await prisma.document.create({
      data: {
        id: id,
        user: {
          connect: { id: session.user.id }
        },
        name: body.name,
        type: body.type,
        url: body.url,
        company: {
          connect: { id: session.user.companyId }
        }
      }
    })

    return NextResponse.json(version)
  } catch (error) {
    console.error("Feil ved opprettelse av dokumentversjon:", error)
    return NextResponse.json({
      error: "Kunne ikke opprette dokumentversjon",
      message: error instanceof Error ? error.message : 'Ukjent feil'
    }, { status: 500 })
  }
} 