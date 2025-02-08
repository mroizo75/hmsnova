import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { CreateFindingInput } from "@/types/safety-rounds"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'SUPPORT'].includes(session.user.role)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const data: CreateFindingInput = await req.json()

    const finding = await prisma.safetyRoundFinding.create({
      data: {
        safetyRoundId: params.id,
        description: data.description,
        severity: data.severity,
        status: 'OPEN',
        location: data.location,
        imageUrl: data.imageUrl,
        dueDate: data.dueDate,
        createdBy: session.user.id,
        assignedTo: data.assignedTo,
        checklistItemId: data.checklistItemId
      },
      include: {
        measures: true
      }
    })

    return NextResponse.json(finding)
  } catch (error) {
    console.error('Error creating finding:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 