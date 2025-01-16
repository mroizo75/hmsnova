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
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Await params før vi bruker id
    const { id } = await params
    const data = await req.json()

    // Validere input
    if (!data.title || !data.content) {
      return NextResponse.json(
        { error: "Mangler påkrevde felt" },
        { status: 400 }
      )
    }

    // Finn høyeste order-verdi
    const highestOrder = await prisma.hMSTemplateSection.findFirst({
      where: { templateId: id },
      orderBy: { order: 'desc' },
      select: { order: true }
    })

    const nextOrder = (highestOrder?.order ?? -1) + 1

    // Opprett ny seksjon
    const section = await prisma.hMSTemplateSection.create({
      data: {
        title: data.title,
        content: data.content,
        order: nextOrder,
        templateId: id,
        lastEditedBy: session.user.id,
        lastEditedAt: new Date(),
        parentId: data.parentId || null
      }
    })

    return NextResponse.json(section)
  } catch (error) {
    console.error('Error creating HMS template section:', error)
    return NextResponse.json(
      { error: "Kunne ikke opprette seksjonen" },
      { status: 500 }
    )
  }
}

// Oppdater også PATCH endepunktet
export async function PATCH(
  request: Request,
  { params }: { params: { id: string, sectionId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'SUPPORT'].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Await params
    const { sectionId } = await params
    const body = await request.json()
    const { content } = body

    const section = await prisma.hMSTemplateSection.update({
      where: { id: sectionId },
      data: { content }
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