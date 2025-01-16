import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"

const updateChecklistItemSchema = z.object({
  response: z.string().optional(),
  comment: z.string().optional(),
  // ... andre felt som kan oppdateres
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; roundId: string; itemId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'SUPPORT'].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Await params før vi bruker dem
    const { id, roundId, itemId } = await params

    const data = await request.json()
    const validatedData = updateChecklistItemSchema.parse(data)

    const item = await prisma.safetyRoundChecklistItem.update({
      where: {
        id: itemId,
        safetyRound: {
          id: roundId,
          module: {
            companyId: id
          }
        }
      },
      data: validatedData
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error updating checklist item:', error)
    return NextResponse.json(
      { error: "Kunne ikke oppdatere sjekkpunkt" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; roundId: string; itemId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'SUPPORT'].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Await params før vi bruker dem
    const { id, roundId, itemId } = await params

    const item = await prisma.safetyRoundChecklistItem.findFirst({
      where: {
        id: itemId,
        safetyRound: {
          id: roundId,
          module: {
            companyId: id
          }
        }
      }
    })

    if (!item) {
      return NextResponse.json(
        { error: "Sjekkpunkt ikke funnet" },
        { status: 404 }
      )
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error fetching checklist item:', error)
    return NextResponse.json(
      { error: "Kunne ikke hente sjekkpunkt" },
      { status: 500 }
    )
  }
} 