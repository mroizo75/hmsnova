import { createNotification } from "@/lib/services/notification-service"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { Role, SJAStatus, NotificationType } from "@prisma/client"
import { uploadToStorage } from "@/lib/storage"

// Valideringsskjema for SJA
const sjaSchema = z.object({
  tittel: z.string().min(3, "Tittel må være minst 3 tegn"),
  arbeidssted: z.string().min(3, "Arbeidssted må være minst 3 tegn"),
  beskrivelse: z.string().min(10, "Beskrivelse må være minst 10 tegn"),
  startDato: z.string().transform(str => new Date(str)),
  sluttDato: z.string().transform(str => new Date(str)),
  deltakere: z.string(),
  risikoer: z.string(),
  tiltak: z.string(),
  ansvarlig: z.string(),
  kommentarer: z.string().optional(),
  produkter: z.array(z.object({
    id: z.string(),
    antall: z.string(),
  })).optional(),
  lagreSomMal: z.boolean().optional()
})

// Hjelpefunksjoner for parsing
function parseRisikoer(identifiedRisks: string | null) {
  if (!identifiedRisks) return []
  return identifiedRisks
    .split('\n')
    .filter(line => line.trim())
    .map((risk, index) => ({
      aktivitet: risk.trim(),
      fare: `Fare relatert til: ${risk.trim()}`,
      konsekvens: `Mulig konsekvens av ${risk.trim().toLowerCase()}`,
      sannsynlighet: Math.min(Math.floor(index / 2) + 1, 5),
      alvorlighet: Math.min(Math.floor(index / 2) + 2, 5),
      risikoVerdi: Math.min(Math.floor(index / 2) + 1, 5) * Math.min(Math.floor(index / 2) + 2, 5)
    }))
}

function parseTiltak(riskMitigation: string | null, responsiblePerson: string | null) {
  if (!riskMitigation || !responsiblePerson) return []
  return riskMitigation
    .split('\n')
    .filter(line => line.trim())
    .map(tiltak => ({
      beskrivelse: tiltak.trim().replace(/^[-•\s]+/, ''),
      ansvarlig: responsiblePerson,
      status: 'PLANLAGT',
      frist: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    }))
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const formData = await request.formData()
    const images = formData.getAll('images') as File[]
    
    // Opprett SJA først
    const sja = await prisma.sJA.create({
      data: {
        tittel: formData.get('tittel') as string,
        arbeidssted: formData.get('arbeidssted') as string,
        beskrivelse: formData.get('beskrivelse') as string,
        startDato: new Date(formData.get('startDato') as string),
        sluttDato: new Date(formData.get('sluttDato') as string),
        deltakere: formData.get('deltakere') as string,
        status: "UTKAST",
        opprettetAvId: session.user.id,
        companyId: session.user.companyId,
        // Parse og opprett risikoer og tiltak som egne relasjoner
        risikoer: {
          create: parseRisikoer(formData.get('risikoer') as string)
        },
        tiltak: {
          create: parseTiltak(formData.get('tiltak') as string, formData.get('ansvarlig') as string)
        }
      },
      include: {
        risikoer: true,
        tiltak: true
      }
    })

    // Last opp bilder og opprett SJABilde-relasjoner
    const uploadedImages = []
    for (const image of images) {
      if (image instanceof File) {
        const fileName = `companies/${session.user.companyId}/sja/${sja.id}/images/${Date.now()}-${image.name}`
        const imagePath = await uploadToStorage(image, fileName)
        
        // Opprett SJABilde-relasjon
        const sjaBilde = await prisma.sJABilde.create({
          data: {
            url: imagePath as string,
            lastetOppAvId: session.user.id,
            sjaId: sja.id
          }
        })
        
        uploadedImages.push(sjaBilde)
      }
    }

    // Lagre som mal hvis valgt
    const lagreSomMal = formData.get('lagreSomMal') === 'true'
    if (lagreSomMal) {
      await prisma.sJAMal.create({
        data: {
          tittel: sja.tittel,
          beskrivelse: sja.beskrivelse,
          prosjektNavn: "",
          arbeidssted: sja.arbeidssted,
          deltakere: sja.deltakere,
          ansvarlig: sja.tiltak[0]?.ansvarlig || "",
          arbeidsoppgaver: sja.beskrivelse,
          navn: sja.tittel,

          // Opprett risikoer som egne relasjoner
          risikoer: {
            create: sja.risikoer.map(risiko => ({
              aktivitet: risiko.aktivitet,
              fare: risiko.fare,
              konsekvens: risiko.konsekvens,
              sannsynlighet: risiko.sannsynlighet,
              alvorlighet: risiko.alvorlighet,
              risikoVerdi: risiko.risikoVerdi,
              tiltak: sja.tiltak[0]?.beskrivelse || ""
            }))
          },
          
          // Opprett tiltak som egne relasjoner
          tiltak: {
            create: sja.tiltak.map(tiltak => ({
              beskrivelse: tiltak.beskrivelse,
              ansvarlig: tiltak.ansvarlig,
              frist: tiltak.frist
            }))
          },
          
          // Metadata
          opprettetAvId: session.user.id,
          companyId: session.user.companyId
        }
      })
    }

    // Send notifikasjoner til relevante brukere
    const notifyUsers = await prisma.user.findMany({
      where: {
        companyId: session.user.companyId,
        OR: [
          { role: "COMPANY_ADMIN" },
          { role: "ADMIN" }
        ]
      }
    })

    for (const user of notifyUsers) {
      createNotification({
        type: "SJA_CREATED",
        title: "Ny SJA registrert",
        message: `${session.user.name} har opprettet en ny SJA: ${sja.tittel}`,
        userId: user.id,
        link: `/dashboard/sja/${sja.id}`
      }).catch(console.error)
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        ...sja,
        images: uploadedImages.map(bilde => bilde.url)
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error in POST:', error)
    return NextResponse.json({ 
      success: false,
      error: "Kunne ikke opprette SJA",
      details: error instanceof Error ? error.message : "Ukjent feil"
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const sjaer = await prisma.sJA.findMany({
      where: {
        companyId: session.user.companyId,
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
      orderBy: {
        opprettetDato: "desc",
      },
    })

    return NextResponse.json(sjaer)
  } catch (error) {
    console.error("Feil ved henting av SJA-er:", error)
    return NextResponse.json(
      {
        error: "Kunne ikke hente SJA-er",
        message: error instanceof Error ? error.message : "Ukjent feil",
      },
      { status: 500 }
    )
  }
} 