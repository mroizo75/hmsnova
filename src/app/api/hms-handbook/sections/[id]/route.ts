import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { requireAuth } from "@/lib/utils/auth"
import { z } from "zod"

const updateSectionSchema = z.object({
  title: z.string().min(3),
  content: z.string().optional(),
  order: z.number().optional()
})

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(
  request: Request,
  context: RouteParams
) {
  try {
    const session = await requireAuth()
    const { id } = await context.params

    const section = await prisma.hMSSection.findUnique({
      where: {
        id,
        handbook: {
          companyId: session.user.companyId
        }
      },
      include: {
        subsections: true,
      }
    })

    if (!section) {
      return NextResponse.json({ error: "Seksjon ikke funnet" }, { status: 404 })
    }

    return NextResponse.json(section)
  } catch (error) {
    console.error("Error fetching section:", error)
    return NextResponse.json(
      { error: "Kunne ikke hente seksjonen" },
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
    const { id } = await context.params
    const data = await request.json()

    const validatedData = updateSectionSchema.parse(data)

    const section = await prisma.hMSSection.update({
      where: {
        id,
        handbook: {
          companyId: session.user.companyId
        }
      },
      data: {
        ...validatedData,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(section)
  } catch (error) {
    console.error("Error updating section:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Kunne ikke oppdatere seksjonen" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  context: RouteParams
) {
  try {
    const session = await requireAuth()
    const { id } = await context.params

    await prisma.hMSSection.delete({
      where: {
        id,
        handbook: {
          companyId: session.user.companyId
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting section:", error)
    return NextResponse.json(
      { error: "Kunne ikke slette seksjonen" },
      { status: 500 }
    )
  }
} 