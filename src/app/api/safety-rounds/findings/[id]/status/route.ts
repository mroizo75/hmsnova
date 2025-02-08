import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"
import { FindingStatus } from "@prisma/client"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { status, comment } = await request.json()

    // Valider at status er en gyldig FindingStatus
    if (!Object.values(FindingStatus).includes(status as FindingStatus)) {
      return new NextResponse("Invalid status", { status: 400 })
    }

    const finding = await prisma.safetyRoundFinding.update({
      where: {
        id: params.id
      },
      data: {
        status: status as FindingStatus,
        statusComment: comment || null,
        statusUpdatedAt: new Date(),
        statusUpdatedBy: session.user.id
      },
      include: {
        measures: true,
        images: true,
        updatedByUser: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(finding)
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 