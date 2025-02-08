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

    // Hent original mal med alle relasjoner
    const originalTemplate = await prisma.safetyRoundTemplate.findUnique({
      where: { id: params.id },
      include: {
        sections: {
          include: {
            checkpoints: true
          }
        }
      }
    })

    if (!originalTemplate) {
      return new NextResponse('Template not found', { status: 404 })
    }

    // Opprett kopi med transaksjoner
    const duplicatedTemplate = await prisma.$transaction(async (tx) => {
      // 1. Opprett ny mal
      const newTemplate = await tx.safetyRoundTemplate.create({
        data: {
          name: `${originalTemplate.name} (Kopi)`,
          description: originalTemplate.description,
          industry: originalTemplate.industry,
          isActive: true,
          createdBy: session.user.id,
          version: 1
        }
      })

      // 2. Dupliser seksjoner og sjekkpunkter
      for (const section of originalTemplate.sections) {
        const newSection = await tx.safetyRoundTemplateSection.create({
          data: {
            templateId: newTemplate.id,
            title: section.title,
            description: section.description,
            order: section.order,
          }
        })

        // 3. Dupliser sjekkpunkter for hver seksjon
        for (const checkpoint of section.checkpoints) {
          await tx.safetyRoundCheckpoint.create({
            data: {
              sectionId: newSection.id,
              question: checkpoint.question,
              description: checkpoint.description,
              type: checkpoint.type,
              isRequired: checkpoint.isRequired,
              order: checkpoint.order,
              options: checkpoint.options === null ? undefined : checkpoint.options
            }
          })
        }
      }

      // Returner den nye malen med alle relasjoner
      return tx.safetyRoundTemplate.findUnique({
        where: { id: newTemplate.id },
        include: {
          sections: {
            include: {
              checkpoints: true
            },
            orderBy: {
              order: 'asc'
            }
          }
        }
      })
    })

    return NextResponse.json(duplicatedTemplate)
  } catch (error) {
    console.error('Error duplicating template:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 