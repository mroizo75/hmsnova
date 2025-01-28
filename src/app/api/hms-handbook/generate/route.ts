import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { templateId } = await req.json()
    
    if (!templateId) {
      return NextResponse.json({ error: "Mal ID er påkrevd" }, { status: 400 })
    }

    // Hent malen med alle seksjoner
    const template = await prisma.hMSTemplate.findUnique({
      where: { id: templateId },
      include: {
        sections: {
          orderBy: {
            order: 'asc'
          },
          include: {
            subsections: {
              orderBy: {
                order: 'asc'
              }
            }
          }
        }
      }
    })

    if (!template) {
      return NextResponse.json({ error: "Mal ikke funnet" }, { status: 404 })
    }

    // Opprett eller oppdater HMS-håndbok
    const handbook = await prisma.hMSHandbook.upsert({
      where: {
        companyId: session.user.companyId
      },
      create: {
        companyId: session.user.companyId,
        title: "HMS-håndbok",
        description: "Generert fra mal",
        published: true,
        version: 0
      },
      update: {
        published: true
      }
    })

    // Opprett hovedseksjoner først
    for (const [index, section] of template.sections.entries()) {
      const mainSection = await prisma.hMSSection.create({
        data: {
          title: section.title,
          content: section.content as any,
          order: index,
          handbookId: handbook.id
        }
      })

      // Opprett underseksjoner
      for (const [subIndex, subsection] of section.subsections.entries()) {
        await prisma.hMSSection.create({
          data: {
            title: subsection.title,
            content: subsection.content as any,
            order: subIndex,
            handbookId: handbook.id,
            parentId: mainSection.id
          }
        })
      }
    }

    return NextResponse.json(handbook)
  } catch (error) {
    console.error("Error generating handbook:", error)
    return NextResponse.json({ 
      error: "Kunne ikke generere HMS-håndbok",
      details: error instanceof Error ? error.message : 'Ukjent feil'
    }, { 
      status: 500 
    })
  }
} 