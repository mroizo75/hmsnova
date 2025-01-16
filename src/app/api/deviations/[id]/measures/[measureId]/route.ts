import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { NextResponse } from "next/server"

interface RouteParams {
  params: Promise<{
    id: string
    measureId: string
  }>
}

export async function PATCH(
  req: Request,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Ikke autorisert" },
        { status: 401 }
      )
    }

    const { id, measureId } = await params
    const data = await req.json()
    const db = await prisma

    const measure = await db.deviationMeasure.update({
      where: { 
        id: measureId,
        deviationId: id
      },
      data: {
        status: data.status,
        completedAt: data.completedAt,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(measure)
  } catch (error) {
    console.error("Error updating measure:", error)
    return NextResponse.json(
      { message: "Kunne ikke oppdatere tiltak" },
      { status: 500 }
    )
  }
} 