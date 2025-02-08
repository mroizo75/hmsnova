import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { UpdateSafetyRoundInput } from "@/types/safety-rounds"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'SUPPORT'].includes(session.user.role)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const safetyRound = await prisma.safetyRound.findUnique({
      where: { id: params.id },
      include: {
        company: {
          select: {
            id: true,
            name: true
          }
        },
        template: {
          include: {
            sections: {
              include: {
                checkpoints: true
              }
            }
          }
        },
        creator: {
          select: {
            id: true,
            name: true
          }
        },
        assignedUser: {
          select: {
            id: true,
            name: true
          }
        },
        module: {
          select: {
            id: true,
            key: true,
            label: true
          }
        },
        checklistItems: true,
        findings: {
          include: {
            measures: true
          }
        }
      }
    })

    if (!safetyRound) {
      return new NextResponse('Not Found', { status: 404 })
    }

    return NextResponse.json(safetyRound)
  } catch (error) {
    console.error('Error fetching safety round:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'SUPPORT'].includes(session.user.role)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const data: UpdateSafetyRoundInput = await req.json()

    const safetyRound = await prisma.safetyRound.update({
      where: { id: params.id },
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        assignedTo: data.assignedTo,
        scheduledDate: data.scheduledDate,
        dueDate: data.dueDate,
        completedAt: data.status === 'COMPLETED' ? new Date() : undefined,
        checklistItems: {
          updateMany: data.checklistItems?.map(item => ({
            where: { id: item.id },
            data: {
              response: item.response,
              comment: item.comment,
              imageUrl: item.imageUrl,
              completedAt: item.completedAt,
              completedBy: item.completedBy
            }
          })) || []
        }
      },
      include: {
        company: {
          select: {
            id: true,
            name: true
          }
        },
        template: {
          select: {
            id: true,
            name: true,
            isActive: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true
          }
        },
        assignedUser: {
          select: {
            id: true,
            name: true
          }
        },
        module: {
          select: {
            id: true,
            key: true,
            label: true
          }
        },
        checklistItems: true,
        findings: {
          include: {
            measures: true
          }
        }
      }
    })

    return NextResponse.json(safetyRound)
  } catch (error) {
    console.error('Error updating safety round:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 