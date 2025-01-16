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

    const body = await req.json()
    const { isActive } = body
    const companyId = params.id

    const company = await prisma.company.update({
      where: { 
        id: companyId 
      },
      data: { 
        isActive 
      }
    })

    return NextResponse.json(company)
  } catch (error) {
    if (error instanceof SyntaxError) {
      return new NextResponse("Invalid JSON in request body", { status: 400 })
    }
    console.error('Error updating company status:', error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 