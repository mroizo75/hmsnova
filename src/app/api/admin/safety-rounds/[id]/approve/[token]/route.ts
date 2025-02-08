import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"

export async function POST(
  req: Request,
  { params }: { params: { id: string, token: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const approval = await prisma.safetyRoundApproval.findFirst({
      where: {
        safetyRoundId: params.id,
        token: params.token,
        status: 'PENDING',
        expiresAt: {
          gt: new Date()
        }
      }
    })

    if (!approval) {
      return new NextResponse('Invalid or expired token', { status: 400 })
    }

    // Oppdater godkjenning og vernerunde i én transaksjon
    const result = await prisma.$transaction([
      prisma.safetyRoundApproval.update({
        where: { id: approval.id },
        data: {
          status: 'APPROVED',
          approvedAt: new Date(),
          approvedBy: session.user.id
        }
      }),
      prisma.safetyRound.update({
        where: { id: params.id },
        data: {
          status: 'APPROVED',
          approvedAt: new Date(),
          approvedBy: session.user.id
        }
      })
    ])

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error approving safety round:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 