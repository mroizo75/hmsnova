import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string, sectionId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'SUPPORT'].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, sectionId } = await params
    const body = await request.json()
    const { title, content } = body

    const section = await prisma.hMSTemplateSection.update({
      where: { id: sectionId },
      data: {
        ...(title && { title }),
        ...(content && { content })
      },
      select: {
        id: true,
        title: true,
        content: true,
        order: true,
        subsections: true
      }
    })

    return NextResponse.json(section)
  } catch (error) {
    console.error('Error updating HMS template section:', error)
    return NextResponse.json(
      { error: "Kunne ikke oppdatere seksjonen" },
      { status: 500 }
    )
  }
} 