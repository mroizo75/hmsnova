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

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const formData = await req.formData()
    
    // Hent data fra formData
    const tittel = formData.get('tittel') as string
    const arbeidssted = formData.get('arbeidssted') as string
    const beskrivelse = formData.get('beskrivelse') as string
    const startDato = formData.get('startDato') as string
    const sluttDato = formData.get('sluttDato') as string
    const deltakere = formData.get('deltakere') as string
    const risikoerText = formData.get('risikoer') as string
    const tiltakText = formData.get('tiltak') as string
    const ansvarlig = formData.get('ansvarlig') as string
    const kommentarer = formData.get('kommentarer') as string
    const lagreSomMal = formData.get('lagreSomMal') === 'true'
    const produkterJson = formData.get('produkter') as string
    const produkter = JSON.parse(produkterJson || '[]')

    // Parse risikoer og tiltak
    const parsedRisikoer = parseRisikoer(risikoerText)
    const parsedTiltak = parseTiltak(tiltakText, ansvarlig)
    
    // Opprett SJA
    const sja = await prisma.sJA.create({
      data: {
        tittel,
        arbeidssted,
        beskrivelse,
        deltakere,
        startDato: new Date(startDato),
        sluttDato: new Date(sluttDato),
        status: "UTKAST",
        opprettetAvId: session.user.id,
        companyId: session.user.companyId,
        risikoer: {
          create: parsedRisikoer
        },
        tiltak: {
          create: parsedTiltak
        },
        produkter: {
          create: produkter.map((p: any) => ({
            produktId: p.produktId,
            mengde: p.mengde
          }))
        }
      },
      include: {
        risikoer: true,
        tiltak: true,
        produkter: true,
        opprettetAv: true
      }
    })

    // Håndter bilder hvis de finnes
    const images = formData.getAll('images') as File[]
    if (images.length > 0) {
      for (const image of images) {
        const url = await uploadToStorage(image, session.user.id, sja.id)
        await prisma.sJABilde.create({
          data: {
            sjaId: sja.id,
            url,
            lastetOppAvId: session.user.id
          }
        })
      }
    }

    return NextResponse.json({ success: true, data: sja })
  } catch (error) {
    console.error('Error creating SJA:', error)
    return NextResponse.json(
      { success: false, error: 'Could not create SJA' },
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