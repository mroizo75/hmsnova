import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { getUserPermissions } from "@/lib/auth/permissions"

// Standard kompetansetyper som skal opprettes for alle bedrifter
const standardCompetenceTypes = [
  {
    name: "Kurs",
    category: "Kurs og sertifiseringer",
    description: "Generelle kurs og opplæring",
    validityPeriod: null,
    isActive: true
  },
  {
    name: "Utdanning",
    category: "Utdanning",
    description: "Formell utdanning som skole, høyskole eller universitet",
    validityPeriod: null,
    isActive: true
  },
  {
    name: "Fagbrev",
    category: "Sertifiseringer",
    description: "Fagbrev eller annen formell kompetanse",
    validityPeriod: null,
    isActive: true
  },
  {
    name: "Førerkort",
    category: "Sertifiseringer",
    description: "Førerkortklasser",
    validityPeriod: 5 * 365, // 5 år
    isActive: true
  },
  {
    name: "HMS kurs",
    category: "HMS",
    description: "HMS kurs og opplæring",
    validityPeriod: 2 * 365, // 2 år
    isActive: true
  },
  {
    name: "Førstehjelpskurs",
    category: "HMS",
    description: "Generell førstehjelp",
    validityPeriod: 365, // 1 år
    isActive: true
  },
  {
    name: "Fallsikring",
    category: "HMS",
    description: "Kurs i fallsikring og arbeid i høyden",
    validityPeriod: 365, // 1 år
    isActive: true
  },
  {
    name: "Maskinførerbevis",
    category: "Sertifiseringer",
    description: "Maskinførerbevis for ulike maskiner",
    validityPeriod: 5 * 365, // 5 år
    isActive: true
  }
];

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
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
    return NextResponse.json({ error: "Module not active" }, { status: 403 })
  }
  
  // Fjerner tilgangskontroll slik at alle ansatte kan opprette standard kompetansetyper
  // Ansatte kan bare opprette kompetansetyper for egen bedrift
  
  try {
    const importedTypes = []
    const skippedTypes = []
    
    // Gå gjennom alle kompetansetyper
    for (const type of standardCompetenceTypes) {
      // Sjekk om denne typen allerede eksisterer for denne bedriften
      const existingType = await prisma.competenceType.findFirst({
        where: {
          companyId: session.user.companyId,
          name: type.name,
          category: type.category,
        }
      })
      
      if (!existingType) {
        // Opprett kompetansetypen
        const newType = await prisma.competenceType.create({
          data: {
            name: type.name,
            description: type.description,
            category: type.category,
            validity: type.validityPeriod,
            reminderMonths: 3, // Standard: 3 måneder før utløp
            isDefault: true,
            isActive: true,
            companyId: session.user.companyId,
          }
        })
        
        importedTypes.push(newType)
      } else {
        skippedTypes.push(type.name)
      }
    }
    
    return NextResponse.json({ 
      success: true,
      message: `Importerte ${importedTypes.length} standard kompetansetyper. ${skippedTypes.length} allerede eksisterende typer ble hoppet over.`,
      importedTypes,
      skippedTypes
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error importing standard competence types:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 