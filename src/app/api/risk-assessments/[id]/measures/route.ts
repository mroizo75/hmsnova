import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Ikke autorisert" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    const measures = await prisma.riskAssessmentMeasure.findMany({
      where: {
        riskAssessmentId: context.params.id
      },
      select: {
        id: true,
        description: true,
        type: true,
        status: true,
        priority: true,
        hazardId: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const transformedMeasures = measures.map(measure => ({
      id: measure.id,
      title: measure.description.split('\n')[0],
      description: measure.description,
      status: measure.status,
      type: measure.type,
      priority: measure.priority,
      hazardId: measure.hazardId
    }))

    return new Response(JSON.stringify(transformedMeasures), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })

  } catch (error) {
    console.error("Feil ved henting av tiltak:", error)
    return new Response(
      JSON.stringify({ error: "Kunne ikke hente tiltak" }), 
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
} 