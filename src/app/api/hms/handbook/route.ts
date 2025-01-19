import { NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/lib/db"
import { requireAuth } from "@/lib/utils/auth"

const createHandbookSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  companyId: z.string()
})

export async function POST(request: Request) {
  try {
    const session = await requireAuth()
    const body = await request.json()
    
    const validatedData = createHandbookSchema.parse(body)

    const handbook = await prisma.hMSHandbook.create({
      data: {
        title: validatedData.title,
        description: validatedData.description || '',
        companyId: validatedData.companyId,
        version: 1,
        published: false
      }
    })

    // Logg opprettelsen
    await prisma.auditLog.create({
      data: {
        action: "CREATE_HMS_HANDBOOK",
        entityType: "HMS_HANDBOOK",
        entityId: handbook.id,
        userId: session.user.id,
        companyId: validatedData.companyId,
        details: {
          title: validatedData.title
        }
      }
    })

    return NextResponse.json(handbook)
  } catch (error) {
    console.error("Error creating HMS handbook:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Kunne ikke opprette HMS-håndbok" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await requireAuth()

    const handbooks = await prisma.hMSHandbook.findMany({
      where: {
        companyId: session.user.companyId
      },
      include: {
        sections: {
          orderBy: {
            order: 'asc'
          }
        },
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json(handbooks)
  } catch (error) {
    console.error("Error fetching HMS handbooks:", error)
    return NextResponse.json(
      { error: "Kunne ikke hente HMS-håndbøker" },
      { status: 500 }
    )
  }
} 