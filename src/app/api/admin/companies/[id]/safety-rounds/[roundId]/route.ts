import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"

const updateSafetyRoundSchema = z.object({
  status: z.enum(['DRAFT', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; roundId: string }> }
) {
  try {
    console.log('1. Starting PATCH request')
    
    const session = await getServerSession(authOptions)
    console.log('2. Session:', session)
    
    if (!session?.user || !['ADMIN', 'SUPPORT'].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, roundId } = await params
    console.log('3. Params:', { id, roundId })

    const data = await request.json()
    console.log('4. Received data:', data)

    const validatedData = updateSafetyRoundSchema.parse(data)
    console.log('5. Validated data:', validatedData)

    // Hent eksisterende vernerunde med alle relasjoner
    const existingRound = await prisma.safetyRound.findFirst({
      where: {
        id: roundId,
        module: {
          companyId: id
        }
      },
      include: {
        checklistItems: true,
        findings: {
          include: {
            measures: true
          }
        },
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    console.log('6. Existing round:', existingRound)

    if (!existingRound) {
      return NextResponse.json(
        { error: "Vernerunde ikke funnet" },
        { status: 404 }
      )
    }

    // Oppdater vernerunden
    const updateData = {
      status: validatedData.status,
      ...(validatedData.status === 'COMPLETED' ? { completedAt: new Date() } : {})
    }

    console.log('7. Updating safety round with data:', updateData)

    const updatedRound = await prisma.safetyRound.update({
      where: {
        id: roundId
      },
      data: updateData,
      include: {
        checklistItems: true,
        findings: {
          include: {
            measures: true
          }
        },
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    console.log('8. Updated safety round:', updatedRound)

    return NextResponse.json(updatedRound)
  } catch (error) {
    console.error('Error updating safety round:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Ugyldig data", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Kunne ikke oppdatere vernerunde" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; roundId: string }> }
) {
  try {
    console.log('API: Starting GET request')
    
    const session = await getServerSession(authOptions)
    console.log('API: Session:', session)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, roundId } = await params
    console.log('API: Received params:', { id, roundId })

    const safetyRound = await prisma.safetyRound.findFirst({
      where: {
        id: roundId,
        module: {
          companyId: id
        }
      },
      include: {
        checklistItems: true,
        findings: {
          include: {
            measures: true
          }
        },
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!safetyRound) {
      return NextResponse.json(
        { error: "Vernerunde ikke funnet" },
        { status: 404 }
      )
    }

    console.log('Found safety round with items:', safetyRound)

    return NextResponse.json(safetyRound)
  } catch (error) {
    console.error('Error fetching safety round:', error)
    return NextResponse.json(
      { error: "Kunne ikke hente vernerunde" },
      { status: 500 }
    )
  }
} 