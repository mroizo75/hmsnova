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
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const formData = await req.formData()
    const data = Object.fromEntries(formData)
    const imageFile = formData.get('image') as File | null

    // Først oppretter vi avviket
    const deviation = await prisma.deviation.create({
      data: {
        title: data.title as string,
        description: data.description as string,
        type: data.type as DeviationType,
        category: data.category as string,
        severity: data.severity as Severity,
        location: data.location as string,
        dueDate: data.dueDate ? new Date(data.dueDate as string) : null,
        status: "OPEN",
        reportedBy: session.user.id,
        companyId: session.user.companyId,
        equipmentId: data.equipmentId as string,
        maintenanceRequired: data.maintenanceRequired === 'true'
      }
    })

    // Så laster vi opp bildet med den nye stien
    if (imageFile) {
      // Nå bruker vi deviationId i stien
      const path = `deviations/${deviation.id}/images/${imageFile.name}`
      const imageUrl = await uploadToStorage(imageFile, path, session.user.companyId)
      
      await prisma.deviationImage.create({
        data: {
          url: imageUrl,
          deviationId: deviation.id,
          uploadedBy: session.user.id
        }
      })
    }

    return NextResponse.json(deviation)
  } catch (error) {
    console.error("Error creating deviation:", error)
    return new NextResponse("Internal error", { status: 500 })
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