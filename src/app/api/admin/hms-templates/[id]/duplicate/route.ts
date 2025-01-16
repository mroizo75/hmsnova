import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'SUPPORT'].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const originalTemplate = await prisma.hMSTemplate.findUnique({
      where: { id: params.id },
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

    // Opprett ny mal med kopi av alle seksjoner
    const newTemplate = await prisma.hMSTemplate.create({
      data: {
        name: `${originalTemplate.name} (Kopi)`,
        description: originalTemplate.description,
        industry: originalTemplate.industry,
        sections: {
          create: originalTemplate.sections.map(section => ({
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

    return NextResponse.json(newTemplate)
  } catch (error) {
    console.error('Error duplicating template:', error)
    return NextResponse.json(
      { error: "Kunne ikke duplisere malen" },
      { status: 500 }
    )
  }
} 