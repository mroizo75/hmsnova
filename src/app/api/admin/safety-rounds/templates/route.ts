import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'SUPPORT'].includes(session.user.role)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const templates = await prisma.safetyRoundTemplate.findMany({
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
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Error fetching templates:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'SUPPORT'].includes(session.user.role)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const data = await req.json()

    const template = await prisma.safetyRoundTemplate.create({
      data: {
        name: data.name,
        description: data.description,
        industry: data.industry,
        createdBy: session.user.id,
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

    return NextResponse.json(template)
  } catch (error) {
    console.error('Error creating template:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 