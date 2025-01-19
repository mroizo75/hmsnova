import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { z } from "zod"
import { SJAStatus } from "@prisma/client"

const updateSjaSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  status: z.enum(["DRAFT", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional()
})

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(
  request: Request,
  context: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const { id } = await context.params

    const sja = await prisma.sJA.findUnique({
      where: {
        id,
        companyId: session.user.companyId
      },
      select: {
        opprettetAv: true
      }
    })

    if (!sja) {
      return NextResponse.json({ error: "SJA ikke funnet" }, { status: 404 })
    }

    return NextResponse.json(sja)
  } catch (error) {
    console.error("Error fetching SJA:", error)
    return NextResponse.json(
      { error: "Kunne ikke hente SJA" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  context: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()

    const validatedData = updateSjaSchema.parse(body)

    const sja = await prisma.sJA.update({
      where: {
        id,
        companyId: session.user.companyId
      },
      data: {
        ...validatedData,
        status: validatedData.status as SJAStatus,
        opprettetAv: {
          connect: { id: session.user.id }
        },
        oppdatertDato: new Date()
      }
    })

    // Logg oppdateringen
    await prisma.auditLog.create({
      data: {
        action: "UPDATE_SJA",
        entityType: "SJA",
        entityId: id,
        userId: session.user.id,
        companyId: session.user.companyId,
        details: validatedData
      }
    })

    return NextResponse.json(sja)
  } catch (error) {
    console.error("Error updating SJA:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Kunne ikke oppdatere SJA" },
      { status: 500 }
    )
  }
} 