import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { saveFileToStorage } from "@/lib/storage"
import { getUserPermissions } from "@/lib/auth/permissions"

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
  
  try {
    // Håndter multipart form-data
    console.log('Mottatt forespørsel for kompetanse-registrering');
    const formData = await req.formData();
    
    // Debugg form-verdier
    console.log('Form verdier:', 
      Object.fromEntries(
        Array.from(formData.entries())
          .map(([key, value]) => [key, value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value])
      )
    );
    
    // Hent form-verdier
    const userId = formData.get("userId") as string;
    const competenceTypeId = formData.get("competenceTypeId") as string;
    const achievedDate = formData.get("achievedDate") as string;
    const expiryDateRaw = formData.get("expiryDate") as string | null;
    const description = formData.get("description") as string | null;
    const certificateFile = formData.get("certificateFile") as File;
    
    // Validering av obligatoriske felt
    if (!userId || !competenceTypeId || !achievedDate || !certificateFile) {
      return NextResponse.redirect(
        new URL(`/dashboard/competence/employees/${userId}/add?error=${encodeURIComponent("Manglende obligatoriske felt")}`, req.url)
      );
    }
    
    // Finn brukeren som kompetansen skal legges til for
    const targetUser = await prisma.user.findFirst({
      where: {
        id: userId,
        companyId: session.user.companyId
      }
    })
    
    if (!targetUser) {
      return NextResponse.redirect(
        new URL(`/dashboard/competence/employees?error=${encodeURIComponent("Bruker ikke funnet eller ikke i ditt selskap")}`, req.url)
      );
    }
    
    // Sjekk om bruker har tillatelse til å legge til kompetanse for andre
    // Adminbrukere og HMS-ansvarlige kan legge til for alle
    // Andre brukere kan bare legge til for seg selv
    const permissions = await getUserPermissions(session.user.id)
    const isAdmin = permissions.includes("ADMIN") || permissions.includes("HMS_RESPONSIBLE")
    
    if (!isAdmin && targetUser.id !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have permission to add competence for other users" }, 
        { status: 403 }
      )
    }
    
    // Finn kompetansetypen
    const competenceType = await prisma.competenceType.findFirst({
      where: {
        id: competenceTypeId,
        companyId: session.user.companyId
      }
    })
    
    if (!competenceType) {
      return NextResponse.json(
        { error: "Competence type not found" }, 
        { status: 404 }
      )
    }
    
    // Håndter filopplasting
    // Verifiser filtype
    const validFileTypes = ["application/pdf", "image/jpeg", "image/png"]
    if (!validFileTypes.includes(certificateFile.type)) {
      return NextResponse.redirect(
        new URL(`/dashboard/competence/employees/${userId}/add?error=${encodeURIComponent("Ugyldig filtype. Vennligst last opp PDF, JPG eller PNG")}`, req.url)
      );
    }
    
    // Verifiser filstørrelse (maks 5MB)
    const maxSizeBytes = 5 * 1024 * 1024 // 5MB
    if (certificateFile.size > maxSizeBytes) {
      return NextResponse.redirect(
        new URL(`/dashboard/competence/employees/${userId}/add?error=${encodeURIComponent("Filen er for stor. Maksimal størrelse er 5MB")}`, req.url)
      );
    }
    
    // Last opp fil til lagring
    const filePath = `competence-certificates/${session.user.companyId}/${userId}/${Date.now()}-${certificateFile.name}`
    
    let fileUrl: string;
    try {
      console.log('Starter filopplasting til:', filePath);
      fileUrl = await saveFileToStorage(certificateFile, filePath);
      console.log('Fil vellykket lastet opp:', fileUrl);
    } catch (uploadError) {
      console.error('Feil under filopplasting:', uploadError);
      return NextResponse.redirect(
        new URL(`/dashboard/competence/employees/${userId}/add?error=${encodeURIComponent(`Kunne ikke laste opp fil: ${uploadError instanceof Error ? uploadError.message : 'Ukjent feil'}`)}`, req.url)
      );
    }
    
    // Behandle utløpsdato (kan være null)
    let expiryDate: Date | null = null
    if (expiryDateRaw) {
      expiryDate = new Date(expiryDateRaw)
    } else if (competenceType.validity && competenceType.validity > 0) {
      // Hvis kompetansetypen har en definert gyldighetsperiode, beregn utløpsdato
      const achieved = new Date(achievedDate)
      expiryDate = new Date(achieved)
      expiryDate.setMonth(expiryDate.getMonth() + competenceType.validity)
    }
    
    // Bestem verifiseringsstatus basert på brukerrolle
    // Admin og HMS-ansvarlige får auto-verifisert kompetanse
    const verificationStatus = isAdmin ? "VERIFIED" : "PENDING"
    
    // Opprett ny kompetanse i databasen
    const newCompetence = await prisma.competence.create({
      data: {
        userId,
        competenceTypeId,
        achievedDate: new Date(achievedDate),
        expiryDate,
        notes: description,
        certificateUrl: fileUrl,
        verificationStatus,
      }
    })
    
    // Hvis denne kompetansen utløper, planlegg en påminnelse
    if (expiryDate) {
      // Beregn påminnelsesdato (standard 3 måneder før utløp)
      const reminderMonths = competenceType.reminderMonths || 3
      const reminderDate = new Date(expiryDate)
      reminderDate.setMonth(reminderDate.getMonth() - reminderMonths)
      
      // Opprett påminnelse kun hvis den er i fremtiden
      if (reminderDate > new Date()) {
        await prisma.notification.create({
          data: {
            userId,
            type: "COMPETENCE_EXPIRY",
            title: `Kompetanse utløper snart: ${competenceType.name}`,
            message: `Din kompetanse "${competenceType.name}" utløper ${expiryDate.toLocaleDateString('no-NO')}. Vennligst forny den før utløpsdato.`,
            isRead: false,
            scheduledFor: reminderDate,
            metadata: {
              competenceId: newCompetence.id
            }
          }
        })
      }
    }
    
    // Opprett en notifikasjon til HMS-ansvarlig for å verifisere
    if (verificationStatus === "PENDING") {
      // Finn HMS-ansvarlige i selskapet
      const hmsResponsibles = await prisma.user.findMany({
        where: {
          companyId: session.user.companyId,
          role: {
            in: ["ADMIN", "HMS_RESPONSIBLE"]
          },
          isActive: true
        }
      })
      
      // Send notifikasjon til alle HMS-ansvarlige
      for (const responsible of hmsResponsibles) {
        await prisma.notification.create({
          data: {
            userId: responsible.id,
            type: "COMPETENCE_VERIFICATION_NEEDED",
            title: `Ny kompetanse trenger verifisering`,
            message: `${targetUser.name} har lastet opp et nytt kompetansebevis for "${competenceType.name}" som trenger din verifisering.`,
            isRead: false,
            metadata: {
              competenceId: newCompetence.id,
              userIdToVerify: userId
            }
          }
        })
      }
    }
    
    // Omdiriger til ansattoversikten med suksessmelding
    return NextResponse.redirect(
      new URL(`/dashboard/competence/employees/${userId}?success=true&competenceId=${newCompetence.id}`, req.url)
    );
    
  } catch (error) {
    console.error('Error adding competence:', error)
    
    // Sikre at vi har en userId-verdi selv om den ikke er definert i try-blokken når feilen oppstår
    let errorRedirectUrl = '/dashboard/competence/employees';
    
    try {
      // Hvis userId er definert, bruk den spesifikke siden
      if (typeof userId === 'string' && userId) {
        errorRedirectUrl = `/dashboard/competence/employees/${userId}/add`;
      }
    } catch {
      // Ignorer feil her - bruk standard redirect om det oppstår problemer
    }
    
    return NextResponse.redirect(
      new URL(`${errorRedirectUrl}?error=${encodeURIComponent("Intern serverfeil")}`, req.url)
    );
  }
} 