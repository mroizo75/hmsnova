import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const json = await request.json()
    const { 
      navn,
      beskrivelse,
      tittel,
      prosjektNavn,
      arbeidssted,
      deltakere,
      ansvarlig,
      arbeidsoppgaver,
      risikoer,
      tiltak
    } = json

    const mal = await prisma.sJAMal.create({
      data: {
        navn,
        beskrivelse,
        tittel,
        prosjektNavn,
        arbeidssted,
        deltakere,
        ansvarlig,
        arbeidsoppgaver,
        risikoer: {
          create: risikoer.map((r: any) => ({
            aktivitet: r.aktivitet,
            fare: r.fare,
            konsekvens: r.konsekvens,
            sannsynlighet: r.sannsynlighet,
            alvorlighet: r.alvorlighet,
            risikoVerdi: r.risikoVerdi,
            tiltak: r.tiltak
          }))
        },
        tiltak: {
          create: tiltak.map((t: any) => ({
            beskrivelse: t.beskrivelse,
            ansvarlig: t.ansvarlig,
            frist: t.frist ? new Date(t.frist) : null
          }))
        },
        companyId: session.user.companyId,
        opprettetAvId: session.user.id
      },
      include: {
        risikoer: true,
        tiltak: true
      }
    })

    return NextResponse.json(mal)
  } catch (error) {
    console.error("Feil ved opprettelse av SJA-mal:", error)
    return NextResponse.json(
      { error: "Kunne ikke opprette mal" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const maler = await prisma.sJAMal.findMany({
      where: {
        companyId: session.user.companyId
      },
      include: {
        risikoer: true,
        tiltak: true,
        opprettetAv: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(maler)
  } catch (error) {
    console.error("Feil ved henting av SJA-maler:", error)
    return NextResponse.json(
      { error: "Kunne ikke hente maler" },
      { status: 500 }
    )
  }
} 