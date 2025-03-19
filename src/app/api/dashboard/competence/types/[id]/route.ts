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
  requiresFile: z.boolean().default(true),
})

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id
  
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
  
  // Sjekk at brukeren har tillatelse til å oppdatere kompetansetyper
  const permissions = await getUserPermissions(session.user.id)
  const canManageCompetenceTypes = permissions.includes("ADMIN") || permissions.includes("HMS_RESPONSIBLE")
  
  if (!canManageCompetenceTypes) {
    return NextResponse.json({ 
      error: "You don't have permission to manage competence types" 
    }, { status: 403 })
  }
  
  try {
    // Finn kompetansetypen som skal oppdateres
    const competenceType = await prisma.competenceType.findFirst({
      where: {
        id,
        companyId: session.user.companyId
      }
    })
    
    if (!competenceType) {
      return NextResponse.json({ error: "Competence type not found" }, { status: 404 })
    }
    
    const json = await req.json()
    
    // Valider inndata
    const validatedData = competenceTypeSchema.parse(json)
    
    // Sjekk om en annen kompetansetype med samme navn og kategori allerede eksisterer
    const existingType = await prisma.competenceType.findFirst({
      where: {
        companyId: session.user.companyId,
        name: validatedData.name,
        category: validatedData.category,
        id: { not: id } // Ikke sjekk mot seg selv
      }
    })
    
    if (existingType) {
      return NextResponse.json({ 
        error: "Another competence type with this name already exists in the selected category" 
      }, { status: 400 })
    }
    
    // Oppdater kompetansetype
    const updatedCompetenceType = await prisma.competenceType.update({
      where: { id },
      data: {
        name: validatedData.name,
        description: validatedData.description,
        category: validatedData.category,
        validity: validatedData.validity,
        reminderMonths: validatedData.reminderMonths,
        requiresFile: validatedData.requiresFile,
        updatedAt: new Date()
      }
    })
    
    return NextResponse.json({ 
      success: true, 
      competenceType: updatedCompetenceType 
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Validation error", 
        details: error.format() 
      }, { status: 400 })
    }
    
    console.error('Error updating competence type:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id
  
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  // Sjekk at brukeren har tillatelse til å slette kompetansetyper
  const permissions = await getUserPermissions(session.user.id)
  const canManageCompetenceTypes = permissions.includes("ADMIN") || permissions.includes("HMS_RESPONSIBLE")
  
  if (!canManageCompetenceTypes) {
    return NextResponse.json({ 
      error: "You don't have permission to manage competence types" 
    }, { status: 403 })
  }
  
  try {
    // Finn kompetansetypen som skal slettes
    const competenceType = await prisma.competenceType.findFirst({
      where: {
        id,
        companyId: session.user.companyId
      }
    })
    
    if (!competenceType) {
      return NextResponse.json({ error: "Competence type not found" }, { status: 404 })
    }
    
    // Sjekk om det finnes aktive kompetanser med denne typen
    const associatedCompetencesCount = await prisma.competence.count({
      where: {
        competenceTypeId: id,
        isActive: true
      }
    })
    
    if (associatedCompetencesCount > 0) {
      // Det finnes aktive kompetanser med denne typen, soft-delete
      const updatedCompetenceType = await prisma.competenceType.update({
        where: { id },
        data: {
          isActive: false,
          updatedAt: new Date()
        }
      })
      
      return NextResponse.json({ 
        success: true, 
        message: "Competence type deactivated due to existing associated competencies",
        competenceType: updatedCompetenceType 
      })
    } else {
      // Ingen aktive kompetanser, vi kan gjøre en hard delete
      await prisma.competenceType.delete({
        where: { id }
      })
      
      return NextResponse.json({ 
        success: true, 
        message: "Competence type permanently deleted"
      })
    }
    
  } catch (error) {
    console.error('Error deleting competence type:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 