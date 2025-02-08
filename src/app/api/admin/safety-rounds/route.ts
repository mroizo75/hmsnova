import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { CreateSafetyRoundInput } from "@/types/safety-rounds"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'SUPPORT'].includes(session.user.role)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const safetyRounds = await prisma.safetyRound.findMany({
      include: {
        company: {
          select: {
            id: true,
            name: true
          }
        },
        template: {
          select: {
            id: true,
            name: true,
            isActive: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true
          }
        },
        assignedUser: {
          select: {
            id: true,
            name: true
          }
        },
        module: {
          select: {
            id: true,
            key: true,
            label: true
          }
        },
        checklistItems: true,
        findings: {
          include: {
            measures: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(safetyRounds)
  } catch (error) {
    console.error('Error fetching safety rounds:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'SUPPORT'].includes(session.user.role)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const data: CreateSafetyRoundInput = await req.json()

    // Finn modul for vernerunder
    const module = await prisma.module.findFirst({
      where: {
        companyId: data.companyId,
        key: 'SAFETY_ROUNDS'
      }
    })

    if (!module) {
      return new NextResponse('Module not found', { status: 404 })
    }

    // Opprett vernerunde med sjekkliste fra mal hvis templateId er gitt
    const safetyRound = await prisma.$transaction(async (tx) => {
      const round = await tx.safetyRound.create({
        data: {
          title: data.title,
          description: data.description,
          status: 'DRAFT',
          moduleId: module.id,
          companyId: data.companyId,
          templateId: data.templateId,
          createdBy: session.user.id,
          assignedTo: data.assignedTo,
          scheduledDate: data.scheduledDate,
          dueDate: data.dueDate
        }
      })

      // Hvis mal er valgt, kopier sjekkpunkter fra malen
      if (data.templateId) {
        const template = await tx.safetyRoundTemplate.findUnique({
          where: { id: data.templateId },
          include: {
            sections: {
              include: {
                checkpoints: true
              }
            }
          }
        })

        if (template) {
          for (const section of template.sections) {
            for (const checkpoint of section.checkpoints) {
              await tx.safetyRoundChecklistItem.create({
                data: {
                  safetyRoundId: round.id,
                  category: section.title,
                  question: checkpoint.question,
                  description: checkpoint.description,
                  isRequired: checkpoint.isRequired,
                  order: checkpoint.order
                }
              })
            }
          }
        }
      }

      return tx.safetyRound.findUnique({
        where: { id: round.id },
        include: {
          company: {
            select: {
              id: true,
              name: true
            }
          },
          template: {
            select: {
              id: true,
              name: true,
              isActive: true
            }
          },
          creator: {
            select: {
              id: true,
              name: true
            }
          },
          assignedUser: {
            select: {
              id: true,
              name: true
            }
          },
          module: {
            select: {
              id: true,
              key: true,
              label: true
            }
          },
          checklistItems: true
        }
      })
    })

    return NextResponse.json(safetyRound)
  } catch (error) {
    console.error('Error creating safety round:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 