import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    // Finn modul-ID for vernerunder
    const module = await prisma.module.findFirst({
      where: {
        companyId: session.user.companyId,
        key: 'SAFETY_ROUNDS'
      }
    })

    if (!module) {
      return NextResponse.json(
        { error: "Vernerunde-modulen er ikke aktivert" },
        { status: 403 }
      )
    }

    // Opprett ny vernerunde
    const safetyRound = await prisma.safetyRound.create({
      data: {
        title: data.title,
        description: data.description,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        status: "DRAFT",
        moduleId: module.id,
        companyId: session.user.companyId,
        createdBy: session.user.id
      },
      include: {
        findings: true
      }
    })

    return NextResponse.json(safetyRound)
  } catch (error) {
    console.error('Error creating safety round:', error)
    return NextResponse.json(
      { error: "Kunne ikke opprette vernerunde" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const safetyRounds = await prisma.safetyRound.findMany({
      where: {
        module: {
          companyId: session.user.companyId,
          key: 'SAFETY_ROUNDS'
        }
      },
      include: {
        findings: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(safetyRounds)
  } catch (error) {
    console.error('Error fetching safety rounds:', error)
    return NextResponse.json(
      { error: "Kunne ikke hente vernerunder" },
      { status: 500 }
    )
  }
} 