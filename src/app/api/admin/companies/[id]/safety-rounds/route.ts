import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"
import { defaultChecklistItems } from "@/lib/data/default-checklist"

const createSafetyRoundSchema = z.object({
  title: z.string().min(1, "Tittel er påkrevd"),
  description: z.string().optional(),
  scheduledDate: z.string().min(1, "Dato er påkrevd"),
  dueDate: z.string().optional(),
  assignedTo: z.string().optional(),
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('1. Starting POST request')
    
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'SUPPORT'].includes(session.user.role)) {
      console.log('Unauthorized user:', session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.log('2. User authorized:', session.user.id)

    const { id } = await params
    console.log('3. Company ID:', id)

    const rawData = await request.json()
    console.log('4. Received data:', rawData)
    
    const validatedData = createSafetyRoundSchema.parse(rawData)
    console.log('5. Validated data:', validatedData)

    const module = await prisma.module.findFirst({
      where: {
        companyId: id,
        key: 'SAFETY_ROUNDS'
      },
      include: {
        company: true
      }
    })
    console.log('6. Found module:', module)

    if (!module) {
      return NextResponse.json(
        { error: "Vernerunde-modulen er ikke aktivert" },
        { status: 400 }
      )
    }

    console.log('7. Creating safety round with data:', {
      title: validatedData.title,
      description: validatedData.description || "",
      scheduledDate: validatedData.scheduledDate,
      dueDate: validatedData.dueDate,
      status: 'DRAFT',
      moduleId: module.id,
      createdBy: session.user.id,
      assignedTo: validatedData.assignedTo
    })

    console.log('Default checklist structure:', 
      defaultChecklistItems.map(cat => ({
        category: cat.category,
        itemCount: cat.items.length
      }))
    )

    const checklistItemsToCreate = defaultChecklistItems.flatMap((category, categoryIndex) =>
      category.items.map((item, itemIndex) => ({
        category: category.category,
        question: item.question,
        description: item.description || "",
        isRequired: item.isRequired,
        order: categoryIndex * 100 + itemIndex
      }))
    )

    console.log('Checklist items to create:', checklistItemsToCreate)

    const safetyRound = await prisma.safetyRound.create({
      data: {
        title: validatedData.title,
        description: validatedData.description || "",
        status: 'DRAFT',
        scheduledDate: validatedData.scheduledDate ? new Date(validatedData.scheduledDate) : null,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        checklistItems: {
          create: checklistItemsToCreate
        },
        company: {
          connect: {
            id: module.company.id
          }
        },
        module: {
          connect: {
            id: module.id
          }
        },
        creator: {
          connect: {
            id: session.user.id
          }
        },
        assignedUser: validatedData.assignedTo ? {
          connect: {
            id: validatedData.assignedTo
          }
        } : undefined
      },
      include: {
        checklistItems: {
          orderBy: {
            order: 'asc'
          }
        },
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    console.log('Created safety round with items count:', {
      roundId: safetyRound.id,
      itemsCount: safetyRound.checklistItems.length,
      firstFewItems: safetyRound.checklistItems.slice(0, 3)
    })

    return NextResponse.json(safetyRound)
  } catch (error) {
    // Forbedret feilhåndtering
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Ugyldig data", details: error.errors },
        { status: 400 }
      )
    }

    console.error('Detailed error:', {
      name: (error as any).name,
      message: (error as any).message,
      stack: (error as any).stack,
      cause: (error as any).cause
    })
    
    return NextResponse.json(
      { 
        error: "Kunne ikke opprette vernerunde",
        details: (error as any).message 
      },
      { status: 500 }
    )
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { id } = await params
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const rounds = await prisma.safetyRound.findMany({
      where: {
        module: {
          companyId: id,
          key: 'SAFETY_ROUNDS'
        },
        ...(status === 'active' ? {
          status: {
            in: ['DRAFT', 'IN_PROGRESS']
          }
        } : {})
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        assignedUser: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(rounds)
  } catch (error) {
    console.error("Error fetching safety rounds:", error)
    return new Response("Could not fetch safety rounds", { status: 500 })
  }
} 