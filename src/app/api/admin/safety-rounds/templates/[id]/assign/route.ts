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

    const data = await req.json()
    const { companyId } = data

    // Sjekk om malen eksisterer
    const template = await prisma.safetyRoundTemplate.findUnique({
      where: { id: params.id }
    })

    if (!template) {
      return new NextResponse('Template not found', { status: 404 })
    }

    // Koble mal til bedrift
    const updatedTemplate = await prisma.safetyRoundTemplate.update({
      where: { id: params.id },
      data: {
        companies: {
          connect: { id: companyId }
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

    return NextResponse.json(updatedTemplate)
  } catch (error) {
    console.error('Error assigning template:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 