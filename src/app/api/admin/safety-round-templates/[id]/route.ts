import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'SUPPORT'].includes(session.user.role)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const data = await req.json()

    // Oppdater template med transaksjoner for å sikre dataintegritet
    const template = await prisma.$transaction(async (tx) => {
      // 1. Oppdater hovedmalen
      const updatedTemplate = await tx.safetyRoundTemplate.update({
        where: { id: params.id },
        data: {
          name: data.name,
          description: data.description,
          industry: data.industry,
          isActive: data.isActive
        }
      })

      // 2. Håndter seksjoner
      for (const section of data.sections) {
        if (section.id) {
          // Oppdater eksisterende seksjon
          await tx.safetyRoundTemplateSection.update({
            where: { id: section.id },
            data: {
              title: section.title,
              description: section.description,
              order: section.order
            }
          })
        } else {
          // Opprett ny seksjon
          await tx.safetyRoundTemplateSection.create({
            data: {
              templateId: params.id,
              title: section.title,
              description: section.description,
              order: section.order,
              checkpoints: {
                create: section.checkpoints
              }
            }
          })
        }

        // 3. Håndter sjekkpunkter
        if (section.id) {
          for (const checkpoint of section.checkpoints) {
            if (checkpoint.id) {
              // Oppdater eksisterende sjekkpunkt
              await tx.safetyRoundCheckpoint.update({
                where: { id: checkpoint.id },
                data: {
                  question: checkpoint.question,
                  description: checkpoint.description,
                  type: checkpoint.type,
                  isRequired: checkpoint.isRequired,
                  order: checkpoint.order,
                  options: checkpoint.options
                }
              })
            } else {
              // Opprett nytt sjekkpunkt
              await tx.safetyRoundCheckpoint.create({
                data: {
                  sectionId: section.id,
                  question: checkpoint.question,
                  description: checkpoint.description,
                  type: checkpoint.type,
                  isRequired: checkpoint.isRequired,
                  order: checkpoint.order,
                  options: checkpoint.options
                }
              })
            }
          }
        }
      }

      // Hent oppdatert template med alle relasjoner
      return tx.safetyRoundTemplate.findUnique({
        where: { id: params.id },
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

    return NextResponse.json(template)
  } catch (error) {
    console.error('Error updating template:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 