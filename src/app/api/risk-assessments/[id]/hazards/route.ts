import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { NextResponse } from "next/server"

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function POST(
  req: Request,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Ikke autorisert" },
        { status: 401 }
      )
    }

    const { 
      description, 
      consequence, 
      probability, 
      severity, 
      existingMeasures 
    } = await req.json()

    // Await params for å få tilgang til id
    const { id } = await params
    const db = await prisma

    // Sjekk om brukeren har tilgang til risikovurderingen
    const assessment = await db.riskAssessment.findFirst({
      where: {
        id,
        company: {
          users: {
            some: {
              id: session.user.id
            }
          }
        }
      }
    })

    if (!assessment) {
      return NextResponse.json(
        { message: "Risikovurdering ikke funnet eller ingen tilgang" },
        { status: 404 }
      )
    }

    // Beregn risikonivå (probability * severity)
    const riskLevel = probability * severity

    // Opprett ny fare
    const hazard = await db.hazard.create({
      data: {
        description,
        consequence,
        probability,
        severity,
        riskLevel,
        existingMeasures,
        riskAssessmentId: assessment.id
      }
    })

    // Oppdater sist endret på risikovurderingen
    await db.riskAssessment.update({
      where: { id: assessment.id },
      data: {
        updatedBy: session.user.id,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(hazard)
  } catch (error) {
    console.error("Error creating hazard:", error)
    return NextResponse.json(
      { message: "Kunne ikke legge til fare" },
      { status: 500 }
    )
  }
} 