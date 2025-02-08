import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'SUPPORT'].includes(session.user.role)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const template = await prisma.safetyRoundTemplate.findUnique({
      where: { id: params.id },
      include: {
        companies: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!template) {
      return new NextResponse('Template not found', { status: 404 })
    }

    return NextResponse.json(template.companies)
  } catch (error) {
    console.error('Error fetching assigned companies:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 