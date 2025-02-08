import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const data = await req.json()
    
    const assessment = await prisma.riskAssessment.create({
      data: {
        title: data.title,
        description: data.description,
        department: data.department,
        activity: data.activity,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        companyId: session.user.companyId,
        createdBy: session.user.id,
        // Bruk equipmentId direkte hvis det er en utstyrsvurdering
        equipmentId: data.isEquipmentAssessment ? data.equipmentId : null
      }
    })

    return NextResponse.json(assessment)
  } catch (error) {
    console.error("Error creating risk assessment:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 