import { createNotification } from "@/lib/services/notification-service"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"
import { uploadToStorage } from "@/lib/storage"
import { DeviationType, Severity } from "@prisma/client"


// Definer enum-typer som matcher Prisma-schema
const Status = z.enum(["OPEN", "IN_PROGRESS", "COMPLETED", "CLOSED"])

const createDeviationSchema = z.object({
  title: z.string().min(1, "Tittel er påkrevd"),
  description: z.string().min(1, "Beskrivelse er påkrevd"),
  type: z.nativeEnum(DeviationType),
  category: z.string().min(1, "Kategori er påkrevd"),
  severity: z.nativeEnum(Severity),
  status: Status.default("OPEN"),
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
      status: "OPEN" as const,
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

    const formData = await req.formData()
    
    // Opprett avviket først
    const deviation = await prisma.deviation.create({
      data: {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        type: formData.get('type') as DeviationType,
        category: formData.get('category') as string,
        severity: formData.get('severity') as Severity,
        status: "OPEN",
        location: formData.get('location') as string || null,
        dueDate: formData.get('dueDate') ? new Date(formData.get('dueDate') as string) : null,
        reportedBy: session.user.id,
        companyId: session.user.companyId,
      }
    })

    // Håndter bilde-opplasting
    const image = formData.get('image') as File
    if (image) {
      const fileName = `${Date.now()}-${image.name}`
      const filePath = `companies/deviations/${deviation.id}/images/${fileName}`
      
      await uploadToStorage(image, filePath)

      // Lagre bilde-referansen i databasen
      await prisma.deviationImage.create({
        data: {
          url: filePath,
          uploadedBy: session.user.id,
          deviationId: deviation.id
        }
      })
    }

    // Finn HMS-ansvarlige og admin-brukere
    const notifyUsers = await prisma.user.findMany({
      where: {
        companyId: session.user.companyId,
        OR: [
          { role: "COMPANY_ADMIN" },
          { role: "ADMIN" },
          { role: "EMPLOYEE" }
        ]
      }
    })

    // Send varsling til relevante brukere
    for (const user of notifyUsers) {
      createNotification({
        type: "DEVIATION_CREATED",
        title: "Nytt avvik registrert",
        message: `Et nytt avvik "${deviation.title}" er registrert av ${session.user.name || session.user.email}`,
        userId: user.id,
        link: `/dashboard/deviations/${deviation.id}`
      }).catch(console.error) // Ikke la notifikasjonsfeil stoppe hovedoperasjonen
    }

    // Invalider alle relevante queries
    await Promise.all([
      prisma.deviation.findMany({ // Dette trigger en revalidering av deviation-listen
        where: { companyId: session.user.companyId },
        include: { measures: true, images: true }
      }),
      prisma.deviation.groupBy({ // Dette trigger en revalidering av statistikken
        by: ['status'],
        where: { companyId: session.user.companyId },
        _count: true
      })
    ])

    return NextResponse.json({ 
      success: true, 
      data: {
        ...deviation,
        images: []
      }
    }, { status: 201 })

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