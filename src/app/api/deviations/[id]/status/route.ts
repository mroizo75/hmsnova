import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    const { status, comment } = body

    const deviation = await prisma.deviation.findUnique({
      where: { id: params.id },
      include: { measures: true }
    })

    if (!deviation) {
      return new NextResponse("Avvik ikke funnet", { status: 404 })
    }

    // Oppdater avviket
    const updatedDeviation = await prisma.deviation.update({
      where: { id: params.id },
      data: {
        status,
        ...(status === 'LUKKET' && { closedAt: new Date() }),
        statusHistory: {
          create: {
            status,
            comment: comment || undefined,
            updatedBy: session.user.id
          }
        }
      }
    })

    return NextResponse.json(updatedDeviation)
  } catch (error) {
    console.error("[DEVIATION_STATUS_UPDATE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 