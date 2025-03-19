import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"

// Valideringsskjema for statusendring
const toggleStatusSchema = z.object({
  isActive: z.boolean()
})

interface RouteParams {
  params: { id: string }
}

// PATCH-rute for å endre status på en kompetansetype
export async function PATCH(
  request: Request,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !['ADMIN', 'SUPPORT', 'COMPANY_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    
    // Valider input
    const validationResult = toggleStatusSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Ugyldig input", details: validationResult.error.format() },
        { status: 400 }
      )
    }

    const { isActive } = validationResult.data

    // Sjekk om kompetansetypen eksisterer og tilhører riktig bedrift
    const competenceType = await prisma.competenceType.findFirst({
      where: {
        id,
        companyId: session.user.companyId
      }
    })

    if (!competenceType) {
      return NextResponse.json(
        { error: "Kompetansetypen ble ikke funnet" },
        { status: 404 }
      )
    }

    // Oppdater status
    const updatedCompetenceType = await prisma.competenceType.update({
      where: { id },
      data: { isActive }
    })

    return NextResponse.json({ competenceType: updatedCompetenceType })
  } catch (error) {
    console.error("Error toggling competence type status:", error)
    return NextResponse.json(
      { error: "Kunne ikke endre status på kompetansetypen" }, 
      { status: 500 }
    )
  }
} 