import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { templateId } = await req.json()
    console.log('Generating from template:', templateId)

    // 1. Hent malen med seksjoner
    const template = await prisma.hMSTemplate.findUnique({
      where: { id: templateId },
      include: {
        sections: {
          orderBy: { order: 'asc' },
          include: {
            subsections: {
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    })

    if (!template) {
      return new NextResponse("Template not found", { status: 404 })
    }

    // 2. Opprett ny håndbok som kladd
    const handbook = await prisma.hMSHandbook.create({
      data: {
        status: "DRAFT",
        version: 0,
        title: "HMS-håndbok",
        description: "Generert fra mal",
        companyId: session.user.companyId,
        createdById: session.user.id,
        sections: {
          create: template.sections.map(section => ({
            title: section.title,
            content: section.content,
            order: section.order,
            subsections: {
              create: section.subsections.map(sub => ({
                title: sub.title,
                content: sub.content,
                order: sub.order
              }))
            }
          }))
        }
      }
    })

    return NextResponse.json(handbook)
  } catch (error) {
    console.error("Error generating handbook:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 