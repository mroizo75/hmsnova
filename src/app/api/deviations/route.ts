import { createNotification } from "@/lib/services/notification-service"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"

// Definer enum-typer som matcher Prisma-schema
const DeviationType = z.enum(["NEAR_MISS", "INCIDENT", "ACCIDENT", "IMPROVEMENT", "OBSERVATION"])
const Severity = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"])
const Status = z.enum(["AAPEN", "PAAGAAR", "FULLFOERT", "LUKKET"])

const createDeviationSchema = z.object({
  title: z.string().min(1, "Tittel er påkrevd"),
  description: z.string().min(1, "Beskrivelse er påkrevd"),
  type: DeviationType,
  category: z.string().min(1, "Kategori er påkrevd"),
  severity: Severity,
  status: Status.default("AAPEN"),
  location: z.string().optional(),
  dueDate: z.string().optional().nullable(),
  images: z.array(z.string()).optional().default([])
})

async function parseFormData(req: Request) {
  try {
    console.log('Starting parseFormData...')
    const formData = await req.formData()
    
    // Log alle felt fra formData
    console.log('FormData fields:')
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value)
    }
    
    // Sjekk at alle påkrevde felt er tilstede
    const title = formData.get('title')
    const description = formData.get('description')
    const type = formData.get('type')
    const category = formData.get('category')
    const severity = formData.get('severity')
    
    // Log påkrevde felt
    console.log('Required fields:', {
      title,
      description,
      type,
      category,
      severity
    })

    const parsedData = {
      title: title?.toString() || '',
      description: description?.toString() || '',
      type: type?.toString() || '',
      category: category?.toString() || '',
      severity: severity?.toString() || '',
      location: formData.get('location')?.toString() || '',
      dueDate: formData.get('dueDate')?.toString() || null,
      status: "AAPEN" as const,
      images: []
    }

    console.log('Parsed form data:', parsedData)
    return parsedData
  } catch (error) {
    console.error('Error in parseFormData:', error)
    throw error
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    // Parse form data
    let body
    try {
      body = await parseFormData(req)
    } catch (error) {
      return NextResponse.json({ 
        error: "Kunne ikke parse form data",
        details: error instanceof Error ? error.message : "Ukjent feil"
      }, { status: 400 })
    }

    // Validate data
    const validationResult = createDeviationSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ 
        error: "Valideringsfeil", 
        details: validationResult.error.format(),
        receivedData: body
      }, { status: 400 })
    }

    const data = validationResult.data
    
    // Opprett avviket
    const deviation = await prisma.deviation.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        category: data.category,
        severity: data.severity,
        status: "AAPEN",
        location: data.location || null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        reportedBy: session.user.id,
        companyId: session.user.companyId
      },
      include: {
        company: true
      }
    })

    // Finn HMS-ansvarlige i bedriften
    const hmsManagers = await prisma.user.findMany({
      where: {
        companyId: session.user.companyId,
        role: "COMPANY_ADMIN"
      }
    })

    // Send varsling til HMS-ansvarlige
    for (const manager of hmsManagers) {
      await createNotification({
        type: "DEVIATION_CREATED",
        title: "Nytt avvik registrert",
        message: `Et nytt avvik "${deviation.title}" er registrert av ${session.user.name || session.user.email}`,
        userId: manager.id,
        metadata: {
          deviationId: deviation.id,
          severity: deviation.severity,
          category: deviation.category
        }
      })
    }

    return NextResponse.json({ success: true, data: deviation }, { status: 201 })
  } catch (error) {
    console.error('Error in POST:', error)
    return NextResponse.json({ 
      success: false,
      error: "Kunne ikke opprette avvik",
      details: error instanceof Error ? error.message : "Ukjent feil"
    }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session?.user?.companyId) {
      return new NextResponse(
        JSON.stringify({ success: false, error: "Ikke autorisert" }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const deviations = await prisma.deviation.findMany({
      where: {
        companyId: session.user.companyId,
        reportedBy: session.user.id
      },
      include: {
        images: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return new NextResponse(
      JSON.stringify({ success: true, data: deviations }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Ukjent feil"
    console.error("Error fetching deviations:", errorMessage)
    
    return new NextResponse(
      JSON.stringify({ 
        success: false, 
        error: "Kunne ikke hente avvik",
        details: errorMessage 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
} 