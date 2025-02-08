import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"

export async function PATCH(
  req: Request,
  { params }: { params: { id: string, findingId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'SUPPORT'].includes(session.user.role)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const data = await req.json()

    const finding = await prisma.safetyRoundFinding.update({
      where: { id: params.findingId },
      data: {
        description: data.description,
        severity: data.severity,
        status: data.status,
        location: data.location,
        imageUrl: data.imageUrl,
        dueDate: data.dueDate,
        assignedTo: data.assignedTo
      },
      include: {
        measures: true
      }
    })

    return NextResponse.json(finding)
  } catch (error) {
    console.error('Error updating finding:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 