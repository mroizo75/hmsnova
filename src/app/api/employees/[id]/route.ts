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

    const employee = await prisma.user.findUnique({
      where: {
        id,
        companyId: session.user.companyId
      },
      include: {
        company: true,
      }
    })

    if (!employee) {
      return NextResponse.json({ error: "Ansatt ikke funnet" }, { status: 404 })
    }

    return NextResponse.json(employee)
  } catch (error) {
    console.error("Feil ved henting av ansatt:", error)
    return NextResponse.json({
      error: "Kunne ikke hente ansatt",
      message: error instanceof Error ? error.message : 'Ukjent feil'
    }, { status: 500 })
  }
}

export async function PATCH(
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

    const employee = await prisma.user.update({
      where: {
        id,
        companyId: session.user.companyId
      },
      data: body
    })

    return NextResponse.json(employee)
  } catch (error) {
    console.error("Feil ved oppdatering av ansatt:", error)
    return NextResponse.json({
      error: "Kunne ikke oppdatere ansatt",
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

    await prisma.user.delete({
      where: {
        id,
        companyId: session.user.companyId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Feil ved sletting av ansatt:", error)
    return NextResponse.json({
      error: "Kunne ikke slette ansatt",
      message: error instanceof Error ? error.message : 'Ukjent feil'
    }, { status: 500 })
  }
} 