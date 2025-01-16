import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { status } = await req.json()
    const { id } = params

    const goal = await prisma.hMSGoal.update({
      where: { 
        id,
        companyId: session.user.companyId // Sikre at målet tilhører riktig bedrift
      },
      data: { status }
    })

    return NextResponse.json(goal)
  } catch (error) {
    console.error('Error updating HMS goal:', error)
    return NextResponse.json(
      { error: "Kunne ikke oppdatere HMS-mål" },
      { status: 500 }
    )
  }
} 