import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Await params før vi bruker dem
    const { token } = await params

    // Hent og valider godkjenningstoken
    const approval = await prisma.safetyRoundApproval.findUnique({
      where: { token },
      include: {
        safetyRound: {
          include: {
            module: true
          }
        }
      }
    })

    if (!approval) {
      return NextResponse.json(
        { error: "Ugyldig godkjenningstoken" },
        { status: 400 }
      )
    }

    if (approval.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Godkjenningslenken er utløpt" },
        { status: 400 }
      )
    }

    if (approval.status !== 'PENDING') {
      return NextResponse.json(
        { error: "Rapporten er allerede godkjent" },
        { status: 400 }
      )
    }

    // Oppdater godkjenningsstatus
    await prisma.$transaction([
      prisma.safetyRoundApproval.update({
        where: { id: approval.id },
        data: {
          status: 'APPROVED',
          approvedAt: new Date(),
          approvedBy: session.user.id
        }
      }),
      prisma.safetyRound.update({
        where: { id: approval.safetyRoundId },
        data: {
          status: 'APPROVED',
          approvedAt: new Date(),
          approvedBy: session.user.id
        }
      })
    ])

    return NextResponse.json({ message: "Rapport godkjent" })
  } catch (error) {
    console.error('Error approving safety round:', error)
    return NextResponse.json(
      { error: "Kunne ikke godkjenne rapport" },
      { status: 500 }
    )
  }
} 