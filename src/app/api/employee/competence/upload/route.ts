import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { writeFile } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
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
      return NextResponse.json({ error: "Kompetansemodulen er ikke aktivert" }, { status: 403 })
    }

    const formData = await request.formData()
    
    // Hent feltene fra skjemaet
    const competenceTypeId = formData.get('competenceTypeId') as string
    const achievedDate = formData.get('achievedDate') as string
    const expiryDate = formData.get('expiryDate') as string | null
    const notes = formData.get('notes') as string | null
    const certificateFile = formData.get('certificate') as File

    // Valider feltene
    if (!competenceTypeId || !achievedDate || !certificateFile) {
      return NextResponse.json({ error: "Manglende obligatoriske felt" }, { status: 400 })
    }

    // Sjekk om kompetansetypen eksisterer og tilhører brukerens bedrift
    const competenceType = await prisma.competenceType.findFirst({
      where: {
        id: competenceTypeId,
        companyId: session.user.companyId,
        isActive: true
      }
    })

    if (!competenceType) {
      return NextResponse.json({ error: "Ugyldig kompetansetype" }, { status: 400 })
    }

    // Lagre filen
    let certificateUrl = null
    if (certificateFile.size > 0) {
      // Valider filstørrelse (maks 5MB)
      if (certificateFile.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: "Filen er for stor (maks 5MB)" }, { status: 400 })
      }

      // Valider filtype
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
      if (!allowedTypes.includes(certificateFile.type)) {
        return NextResponse.json({ error: "Ugyldig filformat (kun PDF, JPG, PNG er tillatt)" }, { status: 400 })
      }

      // Generer filnavn og lagre filen
      const fileExtension = certificateFile.name.split('.').pop()
      const fileName = `${uuidv4()}.${fileExtension}`
      const filePath = join(process.cwd(), 'public', 'uploads', 'certificates', fileName)
      
      const fileBuffer = Buffer.from(await certificateFile.arrayBuffer())
      await writeFile(filePath, fileBuffer)
      
      certificateUrl = `/uploads/certificates/${fileName}`
    }

    // Opprett kompetansebeviset i databasen
    const competence = await prisma.competence.create({
      data: {
        userId: session.user.id,
        competenceTypeId,
        achievedDate: new Date(achievedDate),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        certificateUrl,
        notes,
        verificationStatus: 'PENDING'
      }
    })

    // Varsle bedriftsadministratorer om nytt kompetansebevis som venter på verifisering
    const admins = await prisma.user.findMany({
      where: {
        companyId: session.user.companyId,
        role: 'COMPANY_ADMIN'
      }
    })

    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title: `Nytt kompetansebevis venter på verifisering`,
          message: `${session.user.name} har lastet opp et nytt kompetansebevis for ${competenceType.name} som venter på verifisering.`,
          type: 'COMPETENCE',
          read: false
        }
      })
    }

    // Omdiriger tilbake til kompetanseoversikten
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.hmsnova.com"
    return NextResponse.redirect(`${baseUrl}/employee/competence`, { status: 303 })
  } catch (error) {
    console.error("Feil ved opplasting av kompetansebevis:", error)
    return NextResponse.json({ error: "Serverfeil" }, { status: 500 })
  }
} 