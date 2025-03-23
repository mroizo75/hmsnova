import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import prisma from "@/lib/db";
import { z } from "zod";

const competencySchema = z.object({
  userId: z.string(),
  companyId: z.string(),
  competencies: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().min(1, "Kompetansenavn er påkrevd"),
      description: z.string().optional().nullable(),
      expiryDate: z.string().optional().nullable(),
      certificateNumber: z.string().optional().nullable(),
      competenceTypeId: z.string().optional().nullable(),
      certificateUrl: z.string().optional().nullable(),
    })
  )
});

// Schema for sletting av kompetanse
const deleteCompetencySchema = z.object({
  id: z.string(),
  userId: z.string()
});

export async function POST(req: NextRequest) {
  try {
    // Autentiser brukeren
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Ikke autentisert" }, { status: 401 });
    }

    // Hente data fra request
    const data = await req.json();
    
    // Valider data med zod
    const validationResult = competencySchema.safeParse(data);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Ugyldig data", details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const { userId, companyId, competencies } = validationResult.data;
    
    // Sjekk om bruker har tilgang til å oppdatere disse kompetansene
    if (session.user.id !== userId && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Du har ikke tilgang til å endre denne brukerens kompetanser" },
        { status: 403 }
      );
    }
    
    // Sjekk om kompetansemodulen er aktiv for bedriften
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        modules: {
          where: {
            OR: [
              { key: "COMPETENCE", isActive: true },
              { key: "COMPETENCY", isActive: true }
            ]
          }
        }
      }
    });
    
    if (!company || company.modules.length === 0) {
      return NextResponse.json(
        { error: "Kompetansemodulen er ikke aktivert for denne bedriften" },
        { status: 403 }
      );
    }

    // Hent eksisterende personlige kompetanser for brukeren (Competency)
    const existingCompetencies = await prisma.competency.findMany({
      where: { userId }
    });
    
    // Opprett en liste over IDs som er sendt inn
    const submittedIds = competencies
      .filter(comp => comp.id)
      .map(comp => comp.id);
    
    // Finn kompetanser som skal slettes (de som ikke er i den nye listen)
    const competenciesToDelete = existingCompetencies
      .filter(comp => !submittedIds.includes(comp.id))
      .map(comp => comp.id);

    // Behandle kompetanser med kompetansetype-ID
    const competenciesWithTypeId = competencies.filter(comp => 
      comp.competenceTypeId && comp.competenceTypeId !== "custom"
    );
    
    // Forsøk å finne eksisterende kompetanser i Competence tabellen
    // for hver av disse kompetansetypene
    let existingCompetenceRecords: any[] = [];
    
    if (competenciesWithTypeId.length > 0) {
      existingCompetenceRecords = await prisma.competence.findMany({
        where: {
          userId,
          competenceTypeId: {
            in: competenciesWithTypeId.map(c => c.competenceTypeId).filter(Boolean) as string[]
          }
        }
      });
    }
    
    // Forbered transaksjoner
    const transactions = [];
    
    // Legg til slettinger i transaksjonene
    if (competenciesToDelete.length > 0) {
      transactions.push(
        prisma.competency.deleteMany({
          where: {
            id: { in: competenciesToDelete },
            userId: userId
          }
        })
      );
    }
    
    // Behandle personlige kompetanser
    for (const comp of competencies) {
      // Hvis det er en kompetansetype og vi har Competence-modulen
      if (comp.competenceTypeId && comp.competenceTypeId !== "custom") {
        // Sjekk først at kompetansetypen eksisterer
        const competenceType = await prisma.competenceType.findUnique({
          where: { id: comp.competenceTypeId }
        });
        
        if (competenceType) {
          // Sjekk om denne kompetansen allerede finnes i Competence tabellen
          const existingCompetence = existingCompetenceRecords.find(
            ec => ec.competenceTypeId === comp.competenceTypeId
          );
          
          if (existingCompetence) {
            // Hvis den allerede finnes i Competence, oppdater den hvis det er ny dokumentasjon
            if (comp.certificateUrl && comp.certificateUrl !== existingCompetence.certificateUrl) {
              transactions.push(
                prisma.competence.update({
                  where: { id: existingCompetence.id },
                  data: {
                    certificateUrl: comp.certificateUrl,
                    verificationStatus: "PENDING", // Sett status tilbake til PENDING når ny dokumentasjon er lastet opp
                    expiryDate: comp.expiryDate ? new Date(comp.expiryDate) : existingCompetence.expiryDate,
                    notes: comp.description || existingCompetence.notes
                  }
                })
              );
            }
          } else {
            // Hvis den ikke finnes, opprett en ny Competence
            transactions.push(
              prisma.competence.create({
                data: {
                  userId,
                  competenceTypeId: comp.competenceTypeId,
                  achievedDate: new Date(),
                  expiryDate: comp.expiryDate ? new Date(comp.expiryDate) : null,
                  certificateUrl: comp.certificateUrl || null, // Bruk opplastet sertifikat-URL
                  notes: comp.description || null,
                  verificationStatus: "PENDING" // Krever godkjenning av administrator
                }
              })
            );
          }
        }
      }
      
      // For personlige kompetanser (Competency)
      // Sjekk om dette er en eksisterende eller ny kompetanse
      if (comp.id) {
        // Det er en eksisterende kompetanse - finn den
        const existing = existingCompetencies.find(e => e.id === comp.id);
        if (existing) {
          // Oppdater eksisterende
          transactions.push(
            prisma.competency.update({
              where: { id: comp.id },
              data: {
                name: comp.name,
                description: comp.description || null,
                expiryDate: comp.expiryDate ? new Date(comp.expiryDate) : null,
                certificateNumber: comp.certificateNumber || null,
                certificateUrl: comp.certificateUrl || existing.certificateUrl, // Behold eksisterende URL hvis ingen ny er lastet opp
              }
            })
          );
        }
      } else if (!comp.competenceTypeId || comp.competenceTypeId === "custom") {
        // Opprett ny personlig kompetanse hvis det ikke er en kompetansetype
        transactions.push(
          prisma.competency.create({
            data: {
              name: comp.name,
              description: comp.description || null,
              expiryDate: comp.expiryDate ? new Date(comp.expiryDate) : null,
              certificateNumber: comp.certificateNumber || null,
              certificateUrl: comp.certificateUrl || null, // Legg til opplastet sertifikat-URL
              userId,
            }
          })
        );
      }
    }
    
    // Utfør alle transaksjoner
    await prisma.$transaction(transactions);
    
    // Returner oppdaterte kompetanser
    const updatedCompetencies = await prisma.competency.findMany({
      where: { userId }
    });
    
    return NextResponse.json(updatedCompetencies, { status: 200 });
  } catch (error) {
    console.error("Feil ved håndtering av kompetanser:", error);
    return NextResponse.json(
      { error: "Intern serverfeil" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Autentiser brukeren
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Ikke autentisert" }, { status: 401 });
    }

    // Hente data fra request
    const data = await req.json();
    
    // Valider data med zod
    const validationResult = deleteCompetencySchema.safeParse(data);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Ugyldig data", details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const { id, userId } = validationResult.data;
    
    // Sjekk om bruker har tilgang til å slette denne kompetansen
    if (session.user.id !== userId && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Du har ikke tilgang til å slette denne kompetansen" },
        { status: 403 }
      );
    }
    
    // Sjekk at kompetansen finnes og tilhører brukeren
    const competency = await prisma.competency.findUnique({
      where: { id }
    });
    
    if (!competency) {
      return NextResponse.json(
        { error: "Kompetansen finnes ikke" },
        { status: 404 }
      );
    }
    
    if (competency.userId !== userId) {
      return NextResponse.json(
        { error: "Denne kompetansen tilhører ikke brukeren" },
        { status: 403 }
      );
    }
    
    // Slett kompetansen
    await prisma.competency.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Feil ved sletting av kompetanse:", error);
    return NextResponse.json(
      { error: "Intern serverfeil" },
      { status: 500 }
    );
  }
} 