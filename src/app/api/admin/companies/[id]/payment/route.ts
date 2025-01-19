import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(
  request: Request,
  context: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'SUPPORT'].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params

    const company = await prisma.company.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        orgNumber: true,
        paymentStatus: true,
        lastPaymentDate: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!company) {
      return NextResponse.json({ error: "Bedrift ikke funnet" }, { status: 404 })
    }

    return NextResponse.json(company)
  } catch (error) {
    console.error('Error fetching payment info:', error)
    return NextResponse.json(
      { error: "Kunne ikke hente betalingsinformasjon" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  context: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'SUPPORT'].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const data = await request.json()
    
    const company = await prisma.company.update({
      where: {
        id: id
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