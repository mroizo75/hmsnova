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

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!document) {
      return NextResponse.json({ error: "Dokument ikke funnet" }, { status: 404 })
    }

    return NextResponse.json(document)
  } catch (error) {
    console.error("Feil ved henting av dokument:", error)
    return NextResponse.json({
      error: "Kunne ikke hente dokument",
      message: error instanceof Error ? error.message : 'Ukjent feil'
    }, { status: 500 })
  }
}

export async function PUT(
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
    
    const document = await prisma.document.update({
      where: { id },
      data: body
    })

    return NextResponse.json(document)
  } catch (error) {
    console.error("Feil ved oppdatering av dokument:", error)
    return NextResponse.json({
      error: "Kunne ikke oppdatere dokument",
      message: error instanceof Error ? error.message : 'Ukjent feil'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const { id } = await context.params

    await prisma.document.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Feil ved sletting av dokument:", error)
    return NextResponse.json({
      error: "Kunne ikke slette dokument",
      message: error instanceof Error ? error.message : 'Ukjent feil'
    }, { status: 500 })
  }
} 