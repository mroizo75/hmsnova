import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { SJAStatus } from "@prisma/client"

// Hent spesifikk SJA
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const { id } = context.params
    const sja = await prisma.sJA.findFirst({
      where: {
        id,
        companyId: session.user.companyId
      },
      include: {
        opprettetAv: {
          select: {
            name: true,
            email: true,
          },
        },
        risikoer: true,
        tiltak: true,
        produkter: {
          include: {
            produkt: true
          }
        },
        vedlegg: true,
        godkjenninger: {
          include: {
            godkjentAv: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    if (!sja) {
      return NextResponse.json({ error: "SJA ikke funnet" }, { status: 404 })
    }

    return NextResponse.json(sja)
  } catch (error) {
    return NextResponse.json(
      { error: "Kunne ikke hente SJA" },
      { status: 500 }
    )
  }
}

// Oppdater SJA
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const { id } = context.params
    const json = await request.json()

    const sja = await prisma.sJA.findFirst({
      where: {
        id,
        companyId: session.user.companyId
      }
    })

    if (!sja) {
      return NextResponse.json({ error: "SJA ikke funnet" }, { status: 404 })
    }

    // Oppdater SJA
    const oppdatertSja = await prisma.sJA.update({
      where: { id },
      data: {
        tittel: json.tittel,
        arbeidssted: json.arbeidssted,
        beskrivelse: json.beskrivelse,
        startDato: new Date(json.startDato),
        sluttDato: json.sluttDato ? new Date(json.sluttDato) : null,
        // Oppdater produkter hvis de er inkludert
        ...(json.produkter && {
          produkter: {
            deleteMany: {},
            create: json.produkter.map((p: any) => ({
              produktId: p.produktId,
              mengde: p.mengde || ""
            }))
          }
        })
      },
      include: {
        opprettetAv: {
          select: {
            name: true,
            email: true,
          },
        },
        produkter: {
          include: {
            produkt: true
          }
        },
        vedlegg: true,
      }
    })

    return NextResponse.json(oppdatertSja)
  } catch (error) {
    return NextResponse.json(
      { error: "Kunne ikke oppdatere SJA" },
      { status: 500 }
    )
  }
}

// Slett SJA
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const { id } = context.params
    const sja = await prisma.sJA.findFirst({
      where: {
        id,
        companyId: session.user.companyId
      }
    })

    if (!sja) {
      return NextResponse.json({ error: "SJA ikke funnet" }, { status: 404 })
    }

    await prisma.sJA.delete({
      where: { id }
    })

    return NextResponse.json({ message: "SJA slettet" })
  } catch (error) {
    return NextResponse.json(
      { error: "Kunne ikke slette SJA" },
      { status: 500 }
    )
  }
} 