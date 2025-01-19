import { NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/lib/db"
import { requireAuth } from "@/lib/utils/auth"

const releaseSchema = z.object({
  comment: z.string().min(10).optional(),
  version: z.number().optional()
})

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(
  request: Request,
  context: RouteParams
) {
  try {
    const session = await requireAuth()
    const body = await request.json()
    
    const validatedData = releaseSchema.parse(body)
    const { id } = await context.params

    // Finn gjeldende versjon
    const currentHandbook = await prisma.hMSHandbook.findUnique({
      where: {
        id,
        companyId: session.user.companyId
      }
    })

    if (!currentHandbook) {
      return NextResponse.json({ error: "HMS-håndbok ikke funnet" }, { status: 404 })
    }

    // Opprett ny versjon
    const newVersion = currentHandbook.version + 1

    const releasedHandbook = await prisma.hMSHandbook.update({
      where: { id },
      data: {
        published: true,
        version: newVersion,
      }
    })

    // Logg utgivelsen
    await prisma.auditLog.create({
      data: {
        action: "RELEASE_HMS_HANDBOOK",
        entityType: "HMS_HANDBOOK",
        entityId: id,
        userId: session.user.id,
        companyId: session.user.companyId,
        details: {
          version: newVersion,
          comment: validatedData.comment
        }
      }
    })

    return NextResponse.json(releasedHandbook)
  } catch (error) {
    console.error("Error releasing HMS handbook:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    return new NextResponse("Internal error", { status: 500 })
  }
} 