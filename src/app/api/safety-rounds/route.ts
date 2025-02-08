import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"
import { SafetyRoundStatus } from "@prisma/client"

const createSafetyRoundSchema = z.object({
  title: z.string().min(1, "Tittel er påkrevd"),
  description: z.string().optional(),
  templateId: z.string().min(1, "Velg en mal"),
  assignedToId: z.string().min(1, "Velg ansvarlig person"),
  participants: z.array(z.string()).min(1, "Velg minst én deltaker"),
  dueDate: z.string().optional(),
  scheduledDate: z.string().optional(),
  moduleKey: z.string().min(1, "Velg en modul")
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 })
    }

    const validatedData = createSafetyRoundSchema.parse(await req.json())
    const { 
      title, 
      description, 
      moduleKey,
      templateId,
      assignedToId,
      participants,
      dueDate,
      scheduledDate 
    } = validatedData

    // Hent modul basert på nøkkel
    const module = await prisma.module.findFirst({
      where: {
        key: moduleKey,
        companyId: session.user.companyId
      }
    })

    if (!module) {
      return new Response("Module not found", { status: 404 })
    }

    // Hent malen med sjekkpunkter
    const template = await prisma.safetyRoundTemplate.findUnique({
      where: { id: templateId },
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

    if (!template) {
      return new Response("Template not found", { status: 404 })
    }

    // Opprett vernerunde med sjekkpunkter fra malen
    const safetyRound = await prisma.safetyRound.create({
      data: {
        title,
        description,
        status: "DRAFT",
        companyId: session.user.companyId,
        moduleId: module.id,
        templateId: template.id,
        createdBy: session.user.id,
        assignedTo: assignedToId,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
        
        // Kopier sjekkpunkter fra malen
        checklistItems: {
          create: template.sections.flatMap((section, sectionIndex) => 
            section.checkpoints.map((checkpoint, checkpointIndex) => ({
              category: section.title,
              question: checkpoint.question,
              description: checkpoint.description,
              isRequired: checkpoint.isRequired,
              order: (sectionIndex * 100) + checkpointIndex
            }))
          )
        }
      },
      include: {
        template: true,
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        },
        checklistItems: true,
        findings: {
          include: {
            images: true
          }
        },
        images: true
      }
    })

    return Response.json(safetyRound)
  } catch (error) {
    console.error(error)
    return new Response(
      error instanceof z.ZodError 
        ? JSON.stringify({ errors: error.errors }) 
        : "Internal Server Error",
      { status: error instanceof z.ZodError ? 400 : 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = searchParams.get('limit')

    const safetyRounds = await prisma.safetyRound.findMany({
      where: {
        companyId: session.user.companyId,
        ...(status ? { status: status as SafetyRoundStatus } : {})
      },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        },
        checklistItems: {
          orderBy: {
            order: 'asc'
          },
          include: {
            findings: {
              include: {
                images: true,
                measures: true
              },
              orderBy: {
                createdAt: 'desc'
              }
            }
          }
        },
        findings: {
          include: {
            images: true,
            measures: {
              orderBy: {
                createdAt: 'desc'
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        images: true,
        approvals: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        report: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      ...(limit ? { take: parseInt(limit) } : {})
    })

    return NextResponse.json(safetyRounds)
  } catch (error) {
    console.error('Error fetching safety rounds:', error)
    return new NextResponse(
      JSON.stringify({ 
        error: "Kunne ikke hente vernerunder",
        details: error instanceof Error ? error.message : undefined
      }), 
      { status: 500 }
    )
  }
} 