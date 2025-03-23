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
  
  // Sjekk at brukeren har tillatelse til å verifisere kompetanse
  const permissions = await getUserPermissions(session.user.id)
  const canVerify = permissions.includes("ADMIN") || permissions.includes("HMS_RESPONSIBLE")
  
  if (!canVerify) {
    return NextResponse.json({ 
      error: "You don't have permission to verify competence" 
    }, { status: 403 })
  }
  
  try {
    // Finn kompetansen som skal verifiseres
    const competence = await prisma.competence.findFirst({
      where: {
        id,
      },
      include: {
        user: true,
        competenceType: true
      }
    })
    
    if (!competence) {
      return NextResponse.json({ error: "Competence not found" }, { status: 404 })
    }
    
    // Sjekk at kompetansen tilhører samme bedrift
    if (competence.user.companyId !== session.user.companyId) {
      return NextResponse.json({ 
        error: "Competence belongs to different company" 
      }, { status: 403 })
    }
    
    // Hent handlingstype fra form-data
    const formData = await req.formData()
    const action = formData.get("action") as string
    
    if (!action || (action !== "approve" && action !== "reject")) {
      return NextResponse.json({ 
        error: "Invalid action" 
      }, { status: 400 })
    }
    
    let newStatus = ""
    if (action === "approve") {
      newStatus = "VERIFIED"
    } else if (action === "reject") {
      newStatus = "REJECTED"
    }
    
    // Oppdater kompetansestatus
    const updatedCompetence = await prisma.competence.update({
      where: { id },
      data: {
        verificationStatus: newStatus,
        verifiedBy: session.user.id,
        verifiedAt: new Date()
      }
    })
    
    // Opprett notifikasjon til brukeren
    await prisma.notification.create({
      data: {
        userId: competence.userId,
        type: action === "approve" ? "COMPETENCE_VERIFIED" : "COMPETENCE_REJECTED",
        title: action === "approve" 
          ? `Kompetanse verifisert: ${competence.competenceType.name}`
          : `Kompetanse avvist: ${competence.competenceType.name}`,
        message: action === "approve"
          ? `Din kompetanse "${competence.competenceType.name}" har blitt verifisert og er nå gyldig.`
          : `Din kompetanse "${competence.competenceType.name}" har blitt avvist. Kontakt HMS-ansvarlig for mer informasjon.`,
        read: false
      }
    })
    
    // Redirect tilbake til oversikten
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.hmsnova.com"
    return NextResponse.redirect(
      `${baseUrl}/dashboard/competence/details/${id}?action=${action}`, 
      { status: 303 }
    )
    
  } catch (error) {
    console.error('Error verifying competence:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 