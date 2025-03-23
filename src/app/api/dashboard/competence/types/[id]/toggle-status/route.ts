import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { getUserPermissions } from "@/lib/auth/permissions"

export async function POST(
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
  
  // Sjekk at brukeren har tillatelse til å administrere kompetansetyper
  const permissions = await getUserPermissions(session.user.id)
  const canManageCompetenceTypes = permissions.includes("ADMIN") || permissions.includes("HMS_RESPONSIBLE")
  
  if (!canManageCompetenceTypes) {
    return NextResponse.json({ 
      error: "You don't have permission to manage competence types" 
    }, { status: 403 })
  }
  
  try {
    // Finn kompetansetypen
    const competenceType = await prisma.competenceType.findFirst({
      where: {
        id,
        companyId: session.user.companyId
      }
    })
    
    if (!competenceType) {
      return NextResponse.json({ error: "Competence type not found" }, { status: 404 })
    }
    
    // Hent form data for å avgjøre om vi skal aktivere eller deaktivere
    const formData = await req.formData()
    const action = formData.get("action") as string
    
    if (action !== "activate" && action !== "deactivate") {
      return NextResponse.json({ 
        error: "Invalid action, must be 'activate' or 'deactivate'" 
      }, { status: 400 })
    }
    
    const isActive = action === "activate"
    
    // Hvis vi deaktiverer, sjekk om det finnes aktive kompetanser med denne typen
    if (!isActive) {
      const associatedCompetencesCount = await prisma.competence.count({
        where: {
          competenceTypeId: id,
          active: true
        }
      })
      
      if (associatedCompetencesCount > 0) {
        // Advar hvis det finnes aktive kompetanser
        // Vi deaktiverer fortsatt, men varsler brukeren
        const updatedCompetenceType = await prisma.competenceType.update({
          where: { id },
          data: {
            isActive,
            updatedAt: new Date()
          }
        })
        
        return NextResponse.json({
          success: true,
          warning: `Deactivated competence type that has ${associatedCompetencesCount} active competence records. These records will still be available but no new competencies of this type can be added.`,
          competenceType: updatedCompetenceType
        })
      }
    }
    
    // Oppdater status
    const updatedCompetenceType = await prisma.competenceType.update({
      where: { id },
      data: {
        isActive,
        updatedAt: new Date()
      }
    })
    
    // Redirect til kompetansetyper-oversikten
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.hmsnova.com"
    return NextResponse.redirect(`${baseUrl}/dashboard/competence/types`, { status: 303 })
    
  } catch (error) {
    console.error('Error toggling competence type status:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 