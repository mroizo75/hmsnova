import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"

const createMeasureSchema = z.object({
  description: z.string().min(1),
  dueDate: z.string().optional(),
  assignedTo: z.string().optional(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
  estimatedCost: z.number().optional(),
})

interface RouteParams {
  params: Promise<{
    companyId: string
    roundId: string
    findingId: string
    measureId: string
  }>
}

export async function POST(
  request: Request,
  context: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'SUPPORT'].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { companyId, roundId, findingId } = await context.params
    const data = await request.json()
    const validatedData = createMeasureSchema.parse(data)

    // Sjekk at funnet tilhører riktig vernerunde og bedrift
    const finding = await prisma.safetyRoundFinding.findFirst({
      where: {
        id: findingId,
        safetyRound: {
          id: roundId,
          module: {
            companyId: companyId
          }
        }
      }
    })

    if (!finding) {
      return NextResponse.json(
        { error: "Funn ikke funnet" },
        { status: 404 }
      )
    }

    const measure = await prisma.safetyRoundMeasure.create({
      data: {
        description: validatedData.description,
        status: 'PLANNED',
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        assignedTo: validatedData.assignedTo,
        priority: validatedData.priority || 'MEDIUM',
        estimatedCost: validatedData.estimatedCost,
        findingId: findingId,
        createdBy: session.user.id
      }
    })

    return NextResponse.json(measure)
  } catch (error) {
    console.error('Error creating measure:', error)
    return NextResponse.json(
      { error: "Kunne ikke registrere tiltak" },
      { status: 500 }
    )
  }
}

// Oppdater status på tiltak (f.eks. markere som utført)
export async function PATCH(
  request: Request,
  context: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'SUPPORT'].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { companyId, roundId, findingId, measureId } = await context.params
    const data = await request.json()
    const { status, completedAt } = data

    const measure = await prisma.safetyRoundMeasure.update({
      where: {
        id: measureId,
        finding: {
          id: findingId,
          safetyRound: {
            id: roundId,
            module: {
              companyId: companyId
            }
          }
        }
      },
      data: {
        status,
        completedAt: completedAt ? new Date(completedAt) : undefined,
        completedBy: status === 'COMPLETED' ? session.user.id : undefined
      }
    })

    return NextResponse.json(measure)
  } catch (error) {
    console.error('Error updating measure:', error)
    return NextResponse.json(
      { error: "Kunne ikke oppdatere tiltak" },
      { status: 500 }
    )
  }
} 