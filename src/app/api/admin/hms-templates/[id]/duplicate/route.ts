import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"

interface RouteParams {
  params: Promise<{ id: string }>
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

    // Hent original mal
    const originalTemplate = await prisma.hMSTemplate.findUnique({
      where: { id },
      include: {
        sections: {
          include: {
            subsections: true
          }
        }
      }
    })

    if (!originalTemplate) {
      return NextResponse.json({ error: "Mal ikke funnet" }, { status: 404 })
    }

    // Opprett kopi av malen
    const duplicatedTemplate = await prisma.hMSTemplate.create({
      data: {
        name: `${originalTemplate.name} (Kopi)`,
        description: originalTemplate.description,
        industry: originalTemplate.industry,
        isDefault: false,
        sections: {
          create: originalTemplate.sections.map((section: any) => ({
            title: section.title,
            content: section.content,
            order: section.order,
            lastEditedBy: session.user.id,
            lastEditedAt: new Date(),
            subsections: {
              create: section.subsections.map((subsection: any) => ({
                title: subsection.title,
                content: subsection.content,
                order: subsection.order,
                lastEditedBy: session.user.id,
                lastEditedAt: new Date()
              }))
            }
          }))
        }
      },
      include: {
        sections: {
          include: {
            subsections: true
          }
        }
      }
    })

    return NextResponse.json(duplicatedTemplate)
  } catch (error) {
    console.error('Error duplicating template:', error)
    return NextResponse.json(
      { error: "Kunne ikke duplisere malen" },
      { status: 500 }
    )
  }
} 