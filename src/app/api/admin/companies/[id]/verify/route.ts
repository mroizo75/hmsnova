import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !['ADMIN', 'SUPPORT'].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { isVerified } = await req.json()
    const { id } = params

    const company = await prisma.company.update({
      where: { id },
      data: { 
        isVerified,
        verificationDate: isVerified ? new Date() : null
      }
    })

    return NextResponse.json(company)
  } catch (error) {
    console.error('Error updating company:', error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 