import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { getUserPermissions } from "@/lib/auth/permissions"
import { z } from "zod"

// Validering av inndata
const competenceTypeSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().optional().nullable(),
  category: z.string().min(2).max(50),
  validity: z.number().int().nonnegative().nullable().optional(),
  reminderMonths: z.number().int().min(1).max(24).default(3).optional(),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  try {
    // Hent alle kompetansetyper for bedriften
    const competenceTypes = await prisma.competenceType.findMany({
      where: {
        companyId: session.user.companyId,
        isActive: true
      },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    })
    
    return NextResponse.json({ competenceTypes })
  } catch (error) {
    console.error('Error getting competence types:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  // Sjekk om kompetansemodulen er aktivert for bedriften
  const competenceModule = await prisma.module.findFirst({
    where: {
      companyId: session.user.companyId,
      key: "COMPETENCE",
      isActive: true
    }
  })

  if (!competenceModule) {
    return NextResponse.json({ error: "Module not active" }, { status: 403 })
  }
  
  // Sjekk at brukeren har tillatelse til å opprette kompetansetyper
  const permissions = await getUserPermissions(session.user.id)
  const canManageCompetenceTypes = permissions.includes("ADMIN") || permissions.includes("HMS_RESPONSIBLE")
  
  if (!canManageCompetenceTypes) {
    return NextResponse.json({ 
      error: "You don't have permission to manage competence types" 
    }, { status: 403 })
  }
  
  try {
    const json = await req.json()
    
    // Valider inndata
    const validatedData = competenceTypeSchema.parse(json)
    
    // Sjekk om en kompetansetype med samme navn og kategori allerede eksisterer
    const existingType = await prisma.competenceType.findFirst({
      where: {
        companyId: session.user.companyId,
        name: validatedData.name,
        category: validatedData.category,
      }
    })
    
    if (existingType) {
      return NextResponse.json({ 
        error: "A competence type with this name already exists in the selected category" 
      }, { status: 400 })
    }
    
    // Opprett ny kompetansetype
    const newCompetenceType = await prisma.competenceType.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        category: validatedData.category,
        validity: validatedData.validity,
        reminderMonths: validatedData.reminderMonths,
        isActive: true,
        companyId: session.user.companyId,
      }
    })
    
    return NextResponse.json({ 
      success: true, 
      competenceType: newCompetenceType 
    }, { status: 201 })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Validation error", 
        details: error.format() 
      }, { status: 400 })
    }
    
    console.error('Error creating competence type:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 