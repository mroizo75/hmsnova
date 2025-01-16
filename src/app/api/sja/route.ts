import { createNotification } from "@/lib/services/notification-service"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"

const createSJASchema = z.object({
  tittel: z.string().min(1),
  arbeidssted: z.string().min(1),
  beskrivelse: z.string().min(1),
  startDato: z.string().transform((str) => new Date(str)),
  sluttDato: z.string().transform((str) => new Date(str)),
  deltakere: z.string().min(1),
  identifiedRisks: z.string().min(1),
  riskMitigation: z.string().min(1),
  responsiblePerson: z.string().min(1),
  comments: z.string().optional(),
  bilder: z.array(z.string()).default([]),
  produkter: z.array(z.string()).default([])
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 })
    }

    const data = await req.json()
    
    // Opprett SJA
    const sja = await prisma.sJA.create({
      data: {
        ...data,
        createdById: session.user.id,
        companyId: session.user.companyId
      },
      include: {
        company: true
      }
    })

    // Finn relevante mottakere (HMS-ledere og verneombud)
    const recipients = await prisma.user.findMany({
      where: {
        companyId: session.user.companyId,
        OR: [
          { role: "HMS_MANAGER" },
          { role: "VERNEOMBUD" }
        ]
      }
    })

    // Send varsling til mottakere
    for (const recipient of recipients) {
      await createNotification({
        type: "SJA_CREATED",
        title: "Ny SJA registrert",
        message: `En ny SJA "${sja.tittel}" er registrert av ${session.user.name || session.user.email}`,
        userId: recipient.id,
        metadata: {
          sjaId: sja.id,
          location: sja.arbeidssted,
          startDate: sja.startDato
        }
      })
    }

    return new Response(JSON.stringify(sja), { status: 201 })
  } catch (error) {
    console.error('Error in SJA POST:', error)
    return new Response(
      JSON.stringify({ error: "Kunne ikke opprette SJA" }), 
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