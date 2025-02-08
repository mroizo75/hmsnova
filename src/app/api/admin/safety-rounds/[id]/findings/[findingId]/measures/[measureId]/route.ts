import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"

export async function PATCH(
  req: Request,
  { params }: { params: { id: string, findingId: string, measureId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'SUPPORT'].includes(session.user.role)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const data = await req.json()

    const measure = await prisma.safetyRoundMeasure.update({
      where: { id: params.measureId },
      data: {
        description: data.description,
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate,
        completedAt: data.status === 'COMPLETED' ? new Date() : null,
        completedBy: data.status === 'COMPLETED' ? session.user.id : null,
        assignedTo: data.assignedTo,
        estimatedCost: data.estimatedCost
      }
    })

    return NextResponse.json(measure)
  } catch (error) {
    console.error('Error updating measure:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 