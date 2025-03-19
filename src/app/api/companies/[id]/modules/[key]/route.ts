import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { requireAuth } from "@/lib/utils/auth"

// PATCH - Aktiver eller deaktiver en modul for en bedrift
export async function PATCH(
  request: Request,
  context: { params: { id: string, key: string } }
) {
  try {
    const session = await requireAuth()
    
    const { id, key } = context.params;
    
    if (!id || !key) {
      return NextResponse.json(
        { error: 'Manglende ID eller modulnøkkel' }, 
        { status: 400 }
      );
    }
    
    // Hent data fra forespørselen
    const data = await request.json();
    const isActive = data.isActive === true; // Konverter eksplisitt til boolean
    
    // Finn modulen som skal oppdateres
    const existingModule = await prisma.module.findFirst({
      where: {
        companyId: id,
        key: {
          startsWith: `${key}_` // Moduler lagres med format MODULENAME_COMPANYID
        }
      }
    });
    
    if (!existingModule) {
      // Hvis modulen ikke eksisterer, opprett en ny
      const moduleInfo = getModuleInfo(key);
      
      const newModule = await prisma.module.create({
        data: {
          key: `${key}_${id}`,
          label: moduleInfo.label,
          description: moduleInfo.description,
          isActive: isActive,
          isDefault: moduleInfo.isDefault,
          companyId: id
        }
      });
      
      return NextResponse.json(newModule);
    }
    
    // Oppdater modulen
    const updatedModule = await prisma.module.update({
      where: {
        id: existingModule.id
      },
      data: {
        isActive: isActive
      }
    });
    
    return NextResponse.json(updatedModule);
  } catch (error) {
    console.error("Error updating module:", error)
    return NextResponse.json(
      { error: "Kunne ikke oppdatere modulstatus" },
      { status: 500 }
    )
  }
}

// Hjelpefunksjon for å få informasjon om en modul
function getModuleInfo(key: string) {
  const moduleInfo: Record<string, { label: string, description: string, isDefault: boolean }> = {
    'HMS_HANDBOOK': {
      label: "HMS Håndbok",
      description: "Standard HMS håndbok med tilpasninger",
      isDefault: true
    },
    'DEVIATIONS': {
      label: "Avvikshåndtering",
      description: "System for registrering og oppfølging av avvik",
      isDefault: true
    },
    'RISK_ASSESSMENT': {
      label: "Risikovurdering",
      description: "Verktøy for risikovurdering og tiltak",
      isDefault: true
    },
    'DOCUMENTS': {
      label: "Dokumenthåndtering", 
      description: "System for dokumenthåndtering og versjonskontroll",
      isDefault: true
    },
    'EMPLOYEES': {
      label: "Ansatthåndtering",
      description: "Administrasjon av ansatte og tilganger",
      isDefault: true
    },
    'SAFETY_ROUNDS': {
      label: "Vernerunder",
      description: "Gjennomføring og oppfølging av vernerunder",
      isDefault: false
    },
    'COMPETENCE': {
      label: "Kompetansestyring",
      description: "System for registrering og oppfølging av kompetanse",
      isDefault: false
    },
    'SJA': {
      label: "Sikker Jobb Analyse",
      description: "Verktøy for sikker jobbanalyse",
      isDefault: false
    },
    'BHT': {
      label: "Bedriftshelsetjeneste",
      description: "Administrasjon av bedriftshelsetjeneste",
      isDefault: false
    }
  };
  
  return moduleInfo[key] || {
    label: key,
    description: `Modul for ${key}`,
    isDefault: false
  };
} 