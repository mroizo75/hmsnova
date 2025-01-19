import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"

interface RouteParams {
  params: Promise<{ id: string }>
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
        isVerified: data.isVerified,
        verificationDate: data.isVerified ? new Date() : null
      }
    })

    return NextResponse.json(company)
  } catch (error) {
    console.error('Error verifying company:', error)
    return NextResponse.json(
      { error: "Kunne ikke verifisere bedrift" },
      { status: 500 }
    )
  }
} 