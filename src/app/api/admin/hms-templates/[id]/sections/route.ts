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

export async function POST(
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

    // Finn høyeste order-verdi
    const lastSection = await prisma.hMSTemplateSection.findFirst({
      where: { templateId: id },
      orderBy: { order: 'desc' }
    })

    const newOrder = lastSection ? lastSection.order + 1 : 0

    const section = await prisma.hMSTemplateSection.create({
      data: {
        title: data.title,
        content: data.content || '',
        order: newOrder,
        templateId: id,
        lastEditedBy: session.user.id,
        lastEditedAt: new Date(),
        version: 1
      }
    })

    return NextResponse.json(section)
  } catch (error) {
    console.error('Error creating section:', error)
    return NextResponse.json(
      { error: "Kunne ikke opprette seksjonen" },
      { status: 500 }
    )
  }
}

// Oppdater PATCH endepunktet
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
    const body = await request.json()
    const { content } = body

    const section = await prisma.hMSTemplateSection.update({
      where: { 
        id: sectionId,
        templateId: id
      },
      data: { 
        content,
        lastEditedBy: session.user.id,
        lastEditedAt: new Date()
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