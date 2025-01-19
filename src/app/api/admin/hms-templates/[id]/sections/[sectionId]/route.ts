import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"

interface RouteParams {
  params: Promise<{
    id: string
    sectionId: string
  }>
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

    const { id, sectionId } = await context.params
    const data = await request.json()

    const section = await prisma.hMSTemplateSection.update({
      where: {
        id: sectionId,
        templateId: id
      },
      data: {
        title: data.title,
        content: data.content,
        order: data.order,
        lastEditedBy: session.user.id,
        lastEditedAt: new Date(),
        version: { increment: 1 }
      }
    })

    return NextResponse.json(section)
  } catch (error) {
    console.error('Error updating section:', error)
    return NextResponse.json(
      { error: "Kunne ikke oppdatere seksjonen" },
      { status: 500 }
    )
  }
} 