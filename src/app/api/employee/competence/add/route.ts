import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { redirect } from "next/navigation"
import { saveFileToStorage } from "@/lib/storage"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Ikke autentisert" }, { status: 401 })
    }

    // Sjekk om det finnes en redirect-parameter i URL-en
    const url = new URL(req.url)
    const redirectPath = url.searchParams.get('redirect') || '/employee/competence'

    // Sjekk om kompetansemodulen er aktivert for bedriften (sjekk både COMPETENCE og COMPETENCY)
    const competenceModule = await prisma.module.findFirst({
      where: {
        companyId: session.user.companyId,
        OR: [
          { key: "COMPETENCE", isActive: true },
          { key: "COMPETENCY", isActive: true }
        ]
      }
    })

    if (!competenceModule) {
      return NextResponse.json({ error: "Kompetansemodulen er ikke aktivert" }, { status: 403 })
    }

    // Multipart form data er vanskelig å håndtere direkte
    // Vi bruker FormData API for å få tilgang til feltene
    const formData = await req.formData()

    // Hent feltdata
    const competenceTypeId = formData.get("competenceTypeId") as string
    const achievedDate = formData.get("achievedDate") as string
    const expiryDate = formData.get("expiryDate") as string || null
    const certificateNumber = formData.get("certificateNumber") as string || null
    const issuer = formData.get("issuer") as string || null
    const notes = formData.get("notes") as string || null
    
    // Kombiner certificateNumber og issuer med notes hvis de finnes
    let combinedNotes = notes || ""
    if (certificateNumber) {
      combinedNotes = `Sertifikatnummer: ${certificateNumber}\n${combinedNotes}`
    }
    if (issuer) {
      combinedNotes = `Utsteder: ${issuer}\n${combinedNotes}`
    }
    combinedNotes = combinedNotes.trim()
    
    // Valider nødvendige felt
    if (!competenceTypeId || !achievedDate) {
      return NextResponse.json({
        error: "Manglende obligatoriske felt (kompetansetype eller oppnådd dato)"
      }, { status: 400 })
    }

    // Sjekk at kompetansetypen eksisterer for bedriften
    const competenceType = await prisma.competenceType.findFirst({
      where: {
        id: competenceTypeId,
        companyId: session.user.companyId
      }
    })

    if (!competenceType) {
      return NextResponse.json({ error: "Ugyldig kompetansetype" }, { status: 400 })
    }

    // Håndter dokumentopplasting
    let documentUrl = null
    const documentFile = formData.get("documentFile") as File | null
    
    if (documentFile && documentFile.size > 0) {
      try {
        // Opprett en unik filbane basert på bedrift, bruker og tidsstempel
        const timestamp = Date.now()
        const fileExtension = documentFile.name.split('.').pop() || 'pdf'
        const filePath = `companies/${session.user.companyId}/competence/${session.user.id}/${timestamp}_certificate.${fileExtension}`
        
        // Last opp filen til Google Cloud Storage
        documentUrl = await saveFileToStorage(documentFile, filePath)
        console.log('Sertifikat lastet opp:', documentUrl)
      } catch (uploadError) {
        console.error('Feil ved opplasting av sertifikat:', uploadError)
        return NextResponse.json({
          error: "Det oppstod en feil ved opplasting av sertifikatfilen"
        }, { status: 500 })
      }
    }

    // Opprett kompetanse i databasen
    const newCompetence = await prisma.competence.create({
      data: {
        userId: session.user.id,
        competenceTypeId,
        verificationStatus: "PENDING",
        achievedDate: new Date(achievedDate),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        certificateUrl: documentUrl,
        notes: combinedNotes,
      }
    })

    // Returner en redirect response istedenfor JSON
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.hmsnova.com"
    return NextResponse.redirect(`${baseUrl}${redirectPath}`, { status: 303 })

  } catch (error) {
    console.error("Feil ved registrering av kompetanse:", error)
    return NextResponse.json({
      error: "Det oppstod en feil ved registrering av kompetanse"
    }, { status: 500 })
  }
} 