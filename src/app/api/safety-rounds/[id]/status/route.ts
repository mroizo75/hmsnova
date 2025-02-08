import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { SafetyRoundStatus } from "@prisma/client"

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { status } = await req.json()

    const updatedSafetyRound = await prisma.safetyRound.update({
      where: { 
        id: params.id,
        companyId: session.user.companyId
      },
      data: { 
        status: status as SafetyRoundStatus,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(updatedSafetyRound)
  } catch (error) {
    console.error('Error updating safety round status:', error)
    return new NextResponse("Error updating status", { status: 500 })
  }
} 