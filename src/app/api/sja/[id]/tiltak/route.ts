import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const { id } = await params
    const tiltakData = await request.json()

    const sja = await prisma.sJA.findFirst({
      where: {
        id,
        companyId: session.user.companyId
      }
    })

    if (!sja) {
      return NextResponse.json({ error: "SJA ikke funnet" }, { status: 404 })
    }

    const tiltak = await prisma.tiltak.create({
      data: {
        ...tiltakData,
        sjaId: id,
        frist: tiltakData.frist ? new Date(tiltakData.frist) : null
      }
    })

    return NextResponse.json(tiltak)
  } catch (error) {
    console.error("Feil ved opprettelse av tiltak:", error)
    return NextResponse.json(
      { error: "Kunne ikke opprette tiltak" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const { id } = await params
    const { tiltak: tiltakListe } = await request.json()

    const sja = await prisma.sJA.findFirst({
      where: {
        id,
        companyId: session.user.companyId
      }
    })

    if (!sja) {
      return NextResponse.json({ error: "SJA ikke funnet" }, { status: 404 })
    }

    // Slett eksisterende tiltak
    await prisma.tiltak.deleteMany({
      where: { sjaId: id }
    })

    // Opprett nye tiltak
    const nyeTiltak = await prisma.tiltak.createMany({
      data: tiltakListe.map((t: any) => ({
        ...t,
        sjaId: id,
        frist: t.frist ? new Date(t.frist) : null
      }))
    })

    return NextResponse.json(nyeTiltak)
  } catch (error) {
    console.error("Feil ved oppdatering av tiltak:", error)
    return NextResponse.json(
      { error: "Kunne ikke oppdatere tiltak" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const { id } = await params
    const { tiltakId, status } = await request.json()

    const sja = await prisma.sJA.findFirst({
      where: {
        id,
        companyId: session.user.companyId
      }
    })

    if (!sja) {
      return NextResponse.json({ error: "SJA ikke funnet" }, { status: 404 })
    }

    const oppdatertTiltak = await prisma.tiltak.update({
      where: {
        id: tiltakId,
        sjaId: id
      },
      data: { status }
    })

    return NextResponse.json(oppdatertTiltak)
  } catch (error) {
    console.error("Feil ved oppdatering av tiltaksstatus:", error)
    return NextResponse.json(
      { error: "Kunne ikke oppdatere tiltaksstatus" },
      { status: 500 }
    )
  }
} 