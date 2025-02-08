import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'SUPPORT'].includes(session.user.role)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const template = await prisma.safetyRoundTemplate.findUnique({
      where: { id: params.id },
      include: {
        sections: {
          include: {
            checkpoints: true
          },
          orderBy: {
            order: 'asc'
          }
        },
        companies: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!template) {
      return new NextResponse('Not Found', { status: 404 })
    }

    return NextResponse.json(template)
  } catch (error) {
    console.error('Error fetching template:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

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

    // Oppdater template med transaksjoner
    const template = await prisma.$transaction(async (tx) => {
      // 1. Slett eksisterende seksjoner og sjekkpunkter
      await tx.safetyRoundCheckpoint.deleteMany({
        where: {
          section: {
            templateId: params.id
          }
        }
      })
      await tx.safetyRoundTemplateSection.deleteMany({
        where: {
          templateId: params.id
        }
      })

      // 2. Oppdater template og opprett nye seksjoner og sjekkpunkter
      return tx.safetyRoundTemplate.update({
        where: { id: params.id },
        data: {
          name: data.name,
          description: data.description,
          industry: data.industry,
          isActive: data.isActive,
          sections: {
            create: data.sections.map((section: any) => ({
              title: section.title,
              description: section.description,
              order: section.order,
              checkpoints: {
                create: section.checkpoints.map((checkpoint: any) => ({
                  question: checkpoint.question,
                  description: checkpoint.description,
                  type: checkpoint.type,
                  isRequired: checkpoint.isRequired,
                  order: checkpoint.order,
                  options: checkpoint.options
                }))
              }
            }))
          }
        },
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

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'SUPPORT'].includes(session.user.role)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    await prisma.safetyRoundTemplate.delete({
      where: { id: params.id }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting template:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 