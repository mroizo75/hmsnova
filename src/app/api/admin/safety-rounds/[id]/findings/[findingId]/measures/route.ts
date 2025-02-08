import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { CreateMeasureInput } from "@/types/safety-rounds"

export async function POST(
  req: Request,
  { params }: { params: { id: string, findingId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'SUPPORT'].includes(session.user.role)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const data: CreateMeasureInput = await req.json()

    const measure = await prisma.safetyRoundMeasure.create({
      data: {
        findingId: params.findingId,
        description: data.description,
        status: 'PLANNED',
        priority: data.priority,
        dueDate: data.dueDate,
        createdBy: session.user.id,
        assignedTo: data.assignedTo,
        estimatedCost: data.estimatedCost
      }
    })

    return NextResponse.json(measure)
  } catch (error) {
    console.error('Error creating measure:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 