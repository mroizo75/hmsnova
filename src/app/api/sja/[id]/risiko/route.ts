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
    const risikoData = await request.json()

    const sja = await prisma.sja.findFirst({
      where: {
        id,
        companyId: session.user.companyId
      }
    })

    if (!sja) {
      return NextResponse.json({ error: "SJA ikke funnet" }, { status: 404 })
    }

    const risiko = await prisma.risiko.create({
      data: {
        ...risikoData,
        sjaId: id
      }
    })

    return NextResponse.json(risiko)
  } catch (error) {
    console.error("Feil ved opprettelse av risiko:", error)
    return NextResponse.json(
      { error: "Kunne ikke opprette risiko" },
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
    const { risikoer } = await request.json()

    const sja = await prisma.sja.findFirst({
      where: {
        id,
        companyId: session.user.companyId
      }
    })

    if (!sja) {
      return NextResponse.json({ error: "SJA ikke funnet" }, { status: 404 })
    }

    // Slett eksisterende risikoer
    await prisma.risiko.deleteMany({
      where: { sjaId: id }
    })

    // Opprett nye risikoer
    const nyeRisikoer = await prisma.risiko.createMany({
      data: risikoer.map((r: any) => ({
        ...r,
        sjaId: id
      }))
    })

    return NextResponse.json(nyeRisikoer)
  } catch (error) {
    console.error("Feil ved oppdatering av risikoer:", error)
    return NextResponse.json(
      { error: "Kunne ikke oppdatere risikoer" },
      { status: 500 }
    )
  }
} 