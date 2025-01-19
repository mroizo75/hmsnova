import prisma from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"
import { requireAuth } from "@/lib/utils/auth"
import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"

const createMeasureSchema = z.object({
  description: z.string().min(10),
  type: z.enum(["ELIMINATION", "SUBSTITUTION", "ENGINEERING", "ADMINISTRATIVE", "PPE"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  dueDate: z.string().optional().nullable(),
  assignedTo: z.string().optional().nullable()
})

const closeMeasureSchema = z.object({
  closeComment: z.string().min(10, "Begrunnelse må være minst 10 tegn"),
  closureVerifiedBy: z.string().optional()
})

interface RouteParams {
  params: Promise<{ id: string }>
}

const typeLabels: Record<string, string> = {
  "ELIMINATION": "Eliminering",
  "SUBSTITUTION": "Substitusjon",
  "ENGINEERING": "Tekniske tiltak",
  "ADMINISTRATIVE": "Administrative tiltak",
  "PPE": "Personlig verneutstyr"
}

const priorityLabels: Record<string, string> = {
  "LOW": "Lav",
  "MEDIUM": "Medium",
  "HIGH": "Høy",
  "CRITICAL": "Kritisk"
}

export async function POST(
  request: Request,
  context: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new Response(JSON.stringify({ error: "Ikke autorisert" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const data = await request.json()
    console.log("Creating measure with data:", data)

    const { id } = await context.params

    const measure = await prisma.deviationMeasure.create({
      data: {
        description: data.description,
        type: data.type,
        priority: data.priority,
        status: "OPEN",
        deviationId: id,
        createdBy: session.user.id,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        assignedTo: data.assignedTo || null,
        completedAt: null,
        closedAt: null,
        closedBy: null,
        closeComment: null,
        closureVerifiedBy: null,
        closureVerifiedAt: null
      }
    })

    return new Response(JSON.stringify(measure), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error("Error creating measure:", error)
    return new Response(JSON.stringify({
      error: "Kunne ikke opprette tiltak",
      details: error instanceof Error ? error.message : "Ukjent feil"
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export async function GET(
  request: Request,
  context: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params

    const measures = await prisma.deviationMeasure.findMany({
      where: {
        deviationId: id
      },
      include: {

      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(measures)
  } catch (error) {
    console.error('Error fetching measures:', error)
    return NextResponse.json(
      { error: "Kunne ikke hente tiltak" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  context: RouteParams
) {
  try {
    const session = await requireAuth()
    const body = await request.json()
    
    const { measureId } = body
    const validatedData = closeMeasureSchema.parse(body)
    
    const { id: deviationId } = await context.params

    const measure = await prisma.deviationMeasure.update({
      where: {
        id: measureId,
        deviationId: deviationId
      },
      data: {
        status: "CLOSED",
        closedAt: new Date(),
        closedBy: session.user.id,
        closeComment: validatedData.closeComment,
        closureVerifiedBy: validatedData.closureVerifiedBy,
        closureVerifiedAt: validatedData.closureVerifiedBy ? new Date() : null
      }
    })

    // Logg endringen for sporbarhet
    try {
      await prisma.auditLog.create({
        data: {
          action: "CLOSE_MEASURE",
          entityType: "DEVIATION_MEASURE",
          entityId: measureId,
          userId: session.user.id,
          companyId: session.user.companyId,
          details: {
            closeComment: validatedData.closeComment,
            verifiedBy: validatedData.closureVerifiedBy
          }
        }
      })
    } catch (logError) {
      console.warn('Could not create audit log:', logError)
    }

    return NextResponse.json({ data: measure })
  } catch (error) {
    console.error("Error closing measure:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Ugyldig input", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Kunne ikke lukke tiltaket" },
      { status: 500 }
    )
  }
} 