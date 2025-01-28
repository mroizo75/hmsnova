import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { z } from "zod"

interface RouteParams {
  params: { id: string }
}

const closeSchema = z.object({
  comment: z.string().min(10, "Kommentar må være minst 10 tegn")
})

export async function POST(
  request: Request,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: "Ikke autorisert" },
        { status: 401 }
      )
    }

    const { id } = params
    const body = await request.json()
    
    const validatedData = closeSchema.parse(body)

    // Sjekk om alle tiltak er fullført
    const deviation = await prisma.deviation.findUnique({
      where: { id },
      include: {
        measures: true
      }
    })

    if (!deviation) {
      return NextResponse.json(
        { error: "Avvik ikke funnet" },
        { status: 404 }
      )
    }

    const uncompletedMeasures = deviation.measures.filter(
      m => m.status !== "COMPLETED" && m.status !== "CLOSED"
    )

    if (uncompletedMeasures.length > 0) {
      return NextResponse.json(
        { error: "Alle tiltak må være fullført før avviket kan lukkes" },
        { status: 400 }
      )
    }

    // Oppdater avviket
    const updatedDeviation = await prisma.deviation.update({
      where: { id },
      data: {
        status: "LUKKET",
        closedAt: new Date(),
        closedBy: session.user.id,
        updatedAt: new Date(),
        description: deviation.description + "\n\nLukkekommentar: " + validatedData.comment
      }
    })

    return NextResponse.json(updatedDeviation)

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Ugyldig input", details: error.errors },
        { status: 400 }
      )
    }
    
    console.error("Error closing deviation:", error)
    return NextResponse.json(
      { error: "Kunne ikke lukke avvik" },
      { status: 500 }
    )
  }
} 