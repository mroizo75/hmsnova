import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const documents = await prisma.document.findMany({
      where: {
        companyId: session.user.companyId
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json(documents)
  } catch (error) {
    console.error("Feil ved henting av dokumenter:", error)
    return NextResponse.json({
      error: "Kunne ikke hente dokumenter",
      message: error instanceof Error ? error.message : 'Ukjent feil'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const body = await request.json()

    const document = await prisma.document.create({
      data: {
        name: body.name,
        type: body.type,
        url: body.url,
        company: {
          connect: { id: session.user.companyId }
        },
        user: {
          connect: { id: session.user.id }
        }
      }
    })

    return NextResponse.json(document)
  } catch (error) {
    console.error("Feil ved opprettelse av dokument:", error)
    return NextResponse.json({
      error: "Kunne ikke opprette dokument",
      message: error instanceof Error ? error.message : 'Ukjent feil'
    }, { status: 500 })
  }
} 