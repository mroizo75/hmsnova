import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { SJAStatus } from "@prisma/client"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const json = await request.json()
    const {
      jobTitle,
      jobLocation,
      jobDate,
      participants,
      jobDescription,
      identifiedRisks,
      riskMitigation,
      responsiblePerson,
      comments,
      projectId,
      produkter,
      bilder
    } = json

    const sja = await prisma.sJA.create({
      data: {
        tittel: jobTitle,
        arbeidssted: jobLocation,
        beskrivelse: jobDescription,
        startDato: new Date(jobDate),
        status: SJAStatus.UTKAST,
        companyId: session.user.companyId,
        opprettetAvId: session.user.id,
        risikoer: {
          create: [{
            aktivitet: jobDescription,
            fare: identifiedRisks,
            konsekvens: "Må vurderes",
            sannsynlighet: 1,
            alvorlighet: 1,
            risikoVerdi: 1
          }]
        },
        tiltak: {
          create: [{
            beskrivelse: riskMitigation,
            ansvarlig: responsiblePerson,
            status: "Planlagt"
          }]
        },
        bilder: {
          create: bilder.map((bilde: any) => ({
            url: bilde.url,
            beskrivelse: bilde.navn,
            lastetOppAvId: session.user.id
          }))
        },
        // Legg til produkter
        produkter: {
          create: produkter.map((p: any) => ({
            produktId: p.produktId,
            mengde: p.mengde
          }))
        }
      },
      include: {
        opprettetAv: {
          select: {
            name: true,
            email: true
          }
        },
        risikoer: true,
        tiltak: true,
        bilder: true,
        produkter: true
      }
    })

    return NextResponse.json(sja)
  } catch (error) {
    console.error("Feil ved innsending av SJA:", error)
    return NextResponse.json(
      { error: "Kunne ikke sende inn SJA" },
      { status: 500 }
    )
  }
} 