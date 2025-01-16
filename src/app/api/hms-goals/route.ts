import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { description, year } = await req.json()

    const goal = await prisma.hMSGoal.create({
      data: {
        description,
        year,
        companyId: session.user.companyId
      }
    })

    return NextResponse.json(goal)
  } catch (error) {
    console.error('Error creating HMS goal:', error)
    return NextResponse.json(
      { error: "Kunne ikke opprette HMS-mål" },
      { status: 500 }
    )
  }
} 