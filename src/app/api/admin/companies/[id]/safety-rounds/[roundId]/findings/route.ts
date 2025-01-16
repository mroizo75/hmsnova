import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"

const createFindingSchema = z.object({
  description: z.string().min(1, "Beskrivelse er påkrevd"),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  checklistItemId: z.string(),
  location: z.string().optional(),
  imageUrl: z.string().optional()
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; roundId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'SUPPORT'].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, roundId } = await params

    let data
    try {
      data = await request.json()
    } catch (e) {
      return NextResponse.json(
        { error: "Ugyldig JSON data" },
        { status: 400 }
      )
    }

    const validatedData = createFindingSchema.parse(data)

    // Sjekk at sjekkpunktet eksisterer og tilhører vernerunden
    const checklistItem = await prisma.safetyRoundChecklistItem.findFirst({
      where: {
        id: validatedData.checklistItemId,
        safetyRoundId: roundId
      }
    })

    if (!checklistItem) {
      return NextResponse.json(
        { error: "Sjekkpunkt ikke funnet" },
        { status: 404 }
      )
    }

    const finding = await prisma.safetyRoundFinding.create({
      data: {
        description: validatedData.description,
        severity: validatedData.severity,
        status: 'OPEN',
        safetyRound: {
          connect: {
            id: roundId
          }
        },
        checklistItem: {
          connect: {
            id: validatedData.checklistItemId
          }
        },
        createdBy: session.user.id,
        location: validatedData.location,
        imageUrl: validatedData.imageUrl
      },
      include: {
        checklistItem: true,
        safetyRound: true
      }
    })

    return NextResponse.json(finding)
  } catch (error) {
    console.error('Error details:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack
    })

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Ugyldig data", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: "Kunne ikke opprette funn", 
        details: error instanceof Error ? error.message : 'Ukjent feil'
      },
      { status: 500 }
    )
  }
} 