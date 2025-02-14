import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const json = await request.json()
    console.log('Innkommende data:', json)

    const sja = await prisma.sJA.create({
      data: {
        tittel: json.tittel,
        arbeidssted: json.arbeidssted,
        beskrivelse: json.beskrivelse,
        startDato: new Date(json.startDato),
        sluttDato: json.sluttDato ? new Date(json.sluttDato) : null,
        status: json.status || "UTKAST",
        deltakere: json.deltakere,
        companyId: session.user.companyId,
        opprettetAvId: session.user.id,
        bilder: json.bilder?.create ? json.bilder : {
          create: json.bilder?.map((url: string) => ({
            url: url
          })) || []
        },
        produkter: json.produkter,
        risikoer: json.risikoer?.create ? {
          create: json.risikoer.create.map((r: any) => ({
            aktivitet: r.aktivitet,
            fare: r.fare,
            konsekvens: r.konsekvens || '',
            sannsynlighet: r.sannsynlighet,
            alvorlighet: r.alvorlighet,
            risikoVerdi: r.risikoVerdi
          }))
        } : {
          create: json.risikoer?.map((r: any) => ({
            aktivitet: r.aktivitet,
            fare: r.fare,
            konsekvens: r.konsekvens || '',
            sannsynlighet: r.sannsynlighet,
            alvorlighet: r.alvorlighet,
            risikoVerdi: r.risikoVerdi
          })) || []
        },
        tiltak: json.tiltak?.create ? {
          create: json.tiltak.create.map((t: any) => ({
            beskrivelse: t.beskrivelse,
            ansvarlig: t.ansvarlig,
            status: t.status || "PLANLAGT",
            frist: t.frist ? new Date(t.frist) : null
          }))
        } : {
          create: json.tiltak?.map((t: any) => ({
            beskrivelse: t.beskrivelse,
            ansvarlig: t.ansvarlig,
            status: t.status || "PLANLAGT",
            frist: t.frist ? new Date(t.frist) : null
          })) || []
        }
      },
      include: {
        risikoer: true,
        tiltak: true,
        produkter: true,
        bilder: true,
        opprettetAv: {
          select: {
            name: true,
            email: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json(sja)
  } catch (error) {
    console.error("Feil ved oppretting av SJA:", error)
    return NextResponse.json(
      { error: "Kunne ikke opprette SJA" },
      { status: 500 }
    )
  }
} 