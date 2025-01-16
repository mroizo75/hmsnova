import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Ikke autorisert" },
        { status: 401 }
      )
    }

    const { title, description, department, activity, dueDate } = await req.json()

    const db = await prisma

    // Finn brukerens bedrift
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { companyId: true }
    })

    if (!user) {
      return NextResponse.json(
        { message: "Bruker ikke funnet" },
        { status: 404 }
      )
    }

    // Opprett risikovurdering
    const assessment = await db.riskAssessment.create({
      data: {
        title,
        description,
        department,
        activity,
        dueDate: dueDate ? new Date(dueDate) : null,
        companyId: user.companyId,
        createdBy: session.user.id,
        status: "DRAFT"
      }
    })

    return NextResponse.json(assessment)
  } catch (error) {
    console.error("Error creating risk assessment:", error)
    return NextResponse.json(
      { message: "Kunne ikke opprette risikovurdering" },
      { status: 500 }
    )
  }
} 