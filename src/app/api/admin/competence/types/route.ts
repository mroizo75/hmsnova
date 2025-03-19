import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"

// Valideringsskjema for kompetansetype
const competenceTypeSchema = z.object({
  name: z.string().min(2, "Navn må være minst 2 tegn"),
  description: z.string().optional(),
  category: z.string().min(1, "Kategori er påkrevd"),
  subcategory: z.string().optional(),
  validity: z.number().int().nullable(),
  reminderMonths: z.number().int().min(1).default(3),
  requiredFor: z.string().optional(),
  isDefault: z.boolean().default(false)
})

// GET-rute for å hente alle kompetansetyper
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !['ADMIN', 'SUPPORT', 'COMPANY_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const competenceTypes = await prisma.competenceType.findMany({
      where: { 
        companyId: session.user.companyId 
      },
      orderBy: { 
        name: 'asc' 
      }
    })

    return NextResponse.json({ competenceTypes })
  } catch (error) {
    console.error("Error fetching competence types:", error)
    return NextResponse.json(
      { error: "Kunne ikke hente kompetansetyper" }, 
      { status: 500 }
    )
  }
}

// POST-rute for å opprette ny kompetansetype
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !['ADMIN', 'SUPPORT', 'COMPANY_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    
    // Valider input
    const validationResult = competenceTypeSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Ugyldig input", details: validationResult.error.format() },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Sjekk om kompetansetypen allerede eksisterer
    const existingType = await prisma.competenceType.findFirst({
      where: {
        name: data.name,
        companyId: session.user.companyId
      }
    })

    if (existingType) {
      return NextResponse.json(
        { error: "En kompetansetype med dette navnet eksisterer allerede" },
        { status: 400 }
      )
    }

    // Opprett ny kompetansetype
    const competenceType = await prisma.competenceType.create({
      data: {
        ...data,
        companyId: session.user.companyId,
        isActive: true
      }
    })

    return NextResponse.json({ competenceType }, { status: 201 })
  } catch (error) {
    console.error("Error creating competence type:", error)
    return NextResponse.json(
      { error: "Kunne ikke opprette kompetansetype" }, 
      { status: 500 }
    )
  }
} 