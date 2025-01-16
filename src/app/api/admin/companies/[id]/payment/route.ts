import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'SUPPORT'].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    
    const company = await prisma.company.update({
      where: {
        id: params.id
      },
      data: {
        paymentStatus: data.paymentStatus,
        lastPaymentDate: data.lastPaymentDate
      }
    })

    return NextResponse.json(company)
  } catch (error) {
    console.error('Error updating payment status:', error)
    return NextResponse.json(
      { error: "Kunne ikke oppdatere betalingsstatus" },
      { status: 500 }
    )
  }
} 