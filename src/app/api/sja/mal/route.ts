import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

export async function POST(request: NextRequest) {
  console.log('\n=== API: STARTER MAL-OPPRETTELSE ===')
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const json = await request.json()
    console.log('\nAPI: Mottatt mal-data:', JSON.stringify(json, null, 2))

    // Først oppretter vi selve malen
    const mal = await prisma.sJAMal.create({
      data: {
        navn: json.navn,
        beskrivelse: json.beskrivelse,
        tittel: json.tittel,
        arbeidssted: json.arbeidssted,
        deltakere: json.deltakere,
        ansvarlig: json.deltakere,
        arbeidsoppgaver: json.beskrivelse || '',
        companyId: session.user.companyId,
        opprettetAvId: session.user.id
      }
    })

    // Så legger vi til risikoer
    if (json.risikoer?.length > 0) {
      await prisma.sJAMalRisiko.createMany({
        data: json.risikoer.map((r: any) => ({
          malId: mal.id,
          aktivitet: r.aktivitet,
          fare: r.fare,
          konsekvens: r.konsekvens || '',
          sannsynlighet: r.sannsynlighet,
          alvorlighet: r.alvorlighet,
          risikoVerdi: r.risikoVerdi,
          tiltak: r.tiltak || ''
        }))
      })
    }

    // Og til slutt tiltak
    if (json.tiltak?.length > 0) {
      await prisma.sJAMalTiltak.createMany({
        data: json.tiltak.map((t: any) => ({
          malId: mal.id,
          beskrivelse: t.beskrivelse,
          ansvarlig: t.ansvarlig,
          frist: t.frist ? new Date(t.frist) : null
        }))
      })
    }

    // Hent den komplette malen med relasjoner
    const kompletMal = await prisma.sJAMal.findUnique({
      where: { id: mal.id },
      include: {
        risikoer: true,
        tiltak: true
      }
    })

    return NextResponse.json(kompletMal)
  } catch (error) {
    console.error("\nAPI: Feil ved opprettelse av SJA-mal:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Kunne ikke opprette mal" },
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