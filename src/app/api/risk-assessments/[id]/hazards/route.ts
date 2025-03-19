import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { NextResponse } from "next/server"
import { serialize } from "@/lib/utils/serializers"

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
      existingMeasures,
      includeWeatherRisk,
      weatherRiskNotes
    } = await req.json()

    // Verifiser nødvendige data
    if (!description || !consequence || !probability || !severity) {
      console.error("Manglende påkrevde felt", { description, consequence, probability, severity })
      return NextResponse.json(
        { message: "Manglende påkrevde felt" },
        { status: 400 }
      )
    }

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
      console.error("Risikovurdering ikke funnet eller ingen tilgang", { assessmentId: id, userId: session.user.id })
      return NextResponse.json(
        { message: "Risikovurdering ikke funnet eller ingen tilgang" },
        { status: 404 }
      )
    }

    // Beregn risikonivå (probability * severity)
    const riskLevel = probability * severity

    // Juster metadata for å inkludere værrisiko hvis valgt
    const metadata = includeWeatherRisk 
      ? { 
          weatherRisk: { 
            included: true, 
            notes: weatherRiskNotes || "" 
          } 
        }
      : {}

    console.log("Oppretter fare med metadata:", metadata)

    // Opprett ny fare
    const hazard = await db.hazard.create({
      data: {
        description,
        consequence,
        probability,
        severity,
        riskLevel,
        existingMeasures,
        riskAssessmentId: assessment.id,
        // Lagre metadata med værrisikoinformasjon
        metadata: metadata
      }
    })

    console.log("Fare opprettet:", hazard.id, "for risikovurdering:", assessment.id)

    // Oppdater sist endret på risikovurderingen
    await db.riskAssessment.update({
      where: { id: assessment.id },
      data: {
        updatedBy: session.user.id,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(serialize(hazard))
  } catch (error) {
    console.error("Error creating hazard:", error)
    return NextResponse.json(
      { message: "Kunne ikke legge til fare" },
      { status: 500 }
    )
  }
} 