import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/utils/auth"
import prisma from "@/lib/db"
import { Status } from "@prisma/client"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()
    const { status } = await request.json()

    const assessment = await prisma.riskAssessment.update({
      where: { id: params.id },
      data: { 
        status: status as Status  // Bruk Status enum fra Prisma
      }
    })

    return NextResponse.json(assessment)
  } catch (error) {
    console.error('Error updating risk assessment status:', error)
    return NextResponse.json(
      { error: 'Kunne ikke oppdatere status' },
      { status: 500 }
    )
  }
} 