import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'SUPPORT'].includes(session.user.role)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { companyId } = await req.json()

    // Sjekk om bedriften har vernerunde-modulen aktivert
    const company = await prisma.company.findFirst({
      where: {
        id: companyId,
        modules: {
          some: {
            key: 'SAFETY_ROUNDS',
            isActive: true
          }
        }
      }
    })

    if (!company) {
      return new NextResponse(
        'Bedriften har ikke aktivert vernerunde-modulen',
        { status: 400 }
      )
    }

    // Tildel malen til bedriften
    const template = await prisma.safetyRoundTemplate.update({
      where: {
        id: params.id
      },
      data: {
        companies: {
          connect: {
            id: companyId
          }
        }
      },
      include: {
        companies: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error('Error assigning template:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 