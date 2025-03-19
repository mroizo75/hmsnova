import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import bcrypt from "bcryptjs"
import { z } from "zod"

// Standard lagringskapasitet for alle brukere
const DEFAULT_STORAGE_SIZE = "5GB"

// Valideringsskjema
const registerSchema = z.object({
  company: z.object({
    orgNumber: z.string(),
    name: z.string(),
    organizationType: z.string(),
    organizationCode: z.string(),
    website: z.string().optional(),
    subscriptionPlan: z.enum(["STANDARD", "PREMIUM"]),
    employeeCount: z.string(),
    includeBHT: z.enum(["yes", "no"]).optional()
  }),
  user: z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(["COMPANY_ADMIN"])
  })
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log('Register request body:', body) // Debug logging

    const { company, user, subscriptionPlan, employeeCount, includeBHT, moduleNames } = body

    // Konverter employeeCount fra string til number
    const getEmployeeCount = (range: string) => {
      switch (range) {
        case "1-5": return 5
        case "5-10": return 10
        case "10-30": return 30
        default: return 5
      }
    }

    // Konverter storageSize fra string til number
    const getStorageLimit = (size: string) => {
      return parseInt(size.replace("GB", ""))
    }

    // Valider input
    if (!company || !user) {
      console.error('Missing required fields:', { company, user })
      return new Response(
        JSON.stringify({ message: 'Manglende påkrevde felt' }),
        { status: 400 }
      )
    }

    // Opprett bruker og bedrift i Prisma
    try {
      const result = await prisma.$transaction(async (tx) => {
        // Opprett bedrift med vernerunde-info
        const newCompany = await tx.company.create({
          data: {
            orgNumber: company.orgNumber,
            name: company.name,
            organizationType: company.organizationType || 'AS',
            organizationCode: company.organizationCode || 'AS',
            website: company.website || '',
            // Bruk isActive-verdien fra forespørselen, eller true for aktive bedrifter / false for prospects
            isActive: body.company.isActive !== undefined ? body.company.isActive : !body.salesInfo,
            
            // Legg til informasjon om abonnement
            subscriptionPlan: company.subscriptionPlan || "STANDARD",
            employeeCount: getEmployeeCount(employeeCount || "1-5"),
            storageLimit: getStorageLimit(body.storageSize || DEFAULT_STORAGE_SIZE),
            includeVernerunde: body.includeVernerunde || false,
            
            // Sett metadata for prisinfo
            metadata: {
              basePrice: body.basePrice || 699,
              additionalPrice: body.additionalPrice || 0,
              totalPrice: body.totalPrice || 699,
              finalPrice: body.finalPrice || 699,
              discountPercentage: body.discountPercentage || 0,
              discountYears: body.discountYears || 0,
              
              // Legg til salgsinformasjon
              isProspect: body.salesInfo ? true : false,
              potentialValue: body.salesInfo?.potentialValue || 0,
              prospectStage: body.salesInfo?.prospectStage || "LEAD",
              salesNotes: body.salesInfo?.salesNotes || "",
              expectedCloseDate: body.salesInfo?.expectedCloseDate || null
            }
          }
        })

        // Bestem hvilke moduler som skal opprettes
        let modulesToCreate = [];
        
        // Hvis moduleNames er spesifisert i request, bruk disse
        if (moduleNames && Array.isArray(moduleNames) && moduleNames.length > 0) {
          // Map modulnavnene til modulobjekter
          modulesToCreate = moduleNames.map(key => {
            // Sjekk om vi har moduleDetails med mer informasjon om modulene
            let moduleInfo = null;
            if (body.moduleDetails && Array.isArray(body.moduleDetails)) {
              moduleInfo = body.moduleDetails.find(m => m.id === key);
            }
            
            return {
              key: `${key}_${newCompany.id}`,
              label: moduleInfo ? moduleInfo.name : getModuleLabel(key),
              description: moduleInfo ? moduleInfo.description : getModuleDescription(key),
              isActive: true,
              isDefault: moduleInfo ? moduleInfo.isStandard : key !== "SAFETY_ROUNDS" && key !== "COMPETENCE",
              price: moduleInfo?.price || (key === "SAFETY_ROUNDS" || key === "COMPETENCE" ? 199 : 0),
              companyId: newCompany.id
            };
          });

          // Lagre moduleDetails i metadata for senere referanse
          if (body.moduleDetails && Array.isArray(body.moduleDetails)) {
            newCompany.metadata = {
              ...newCompany.metadata,
              moduleDetails: body.moduleDetails
            };
          }
        } else {
          // Opprett standard moduler separat med unike nøkler
          modulesToCreate = [
            {
              key: `HMS_HANDBOOK_${newCompany.id}`,
              label: "HMS Håndbok",
              description: "Standard HMS håndbok med tilpasninger",
              isActive: true,
              isDefault: true,
              companyId: newCompany.id
            },
            {
              key: `DEVIATIONS_${newCompany.id}`,
              label: "Avvikshåndtering",
              description: "System for registrering og oppfølging av avvik",
              isActive: true,
              isDefault: true,
              companyId: newCompany.id
            },
            {
              key: `RISK_ASSESSMENT_${newCompany.id}`,
              label: "Risikovurdering",
              description: "Verktøy for risikovurdering og tiltak",
              isActive: true,
              isDefault: true,
              companyId: newCompany.id
            },
            {
              key: `DOCUMENTS_${newCompany.id}`,
              label: "Dokumenthåndtering",
              description: "System for dokumenthåndtering og versjonskontroll",
              isActive: true,
              isDefault: true,
              companyId: newCompany.id
            },
            {
              key: `EMPLOYEES_${newCompany.id}`,
              label: "Ansatthåndtering",
              description: "Administrasjon av ansatte og tilganger",
              isActive: true,
              isDefault: true,
              companyId: newCompany.id
            }
          ];

          // Legg til SJA-modul for Premium-kunder
          if (subscriptionPlan === "PREMIUM") {
            modulesToCreate.push({
              key: `SJA_${newCompany.id}`,
              label: "Sikker Jobb Analyse",
              description: "Verktøy for sikker jobbanalyse",
              isActive: true,
              isDefault: true,
              companyId: newCompany.id
            });
          }
          
          // Legg til BHT-modul hvis valgt
          if (includeBHT === "yes") {
            modulesToCreate.push({
              key: `BHT_${newCompany.id}`,
              label: "Bedriftshelsetjeneste",
              description: "Administrasjon av bedriftshelsetjeneste",
              isActive: true,
              isDefault: true,
              companyId: newCompany.id
            });
          }
        }
        
        // Opprett alle moduler
        const modules = await Promise.all(
          modulesToCreate.map(moduleData => 
            tx.module.create({ data: moduleData })
          )
        );

        // Opprett bruker
        const hashedPassword = await bcrypt.hash(user.password, 10)
        const newUser = await tx.user.create({
          data: {
            ...user,
            password: hashedPassword,
            companyId: newCompany.id,
          },
        })
        
        // Opprett kontaktperson fra brukerinformasjonen
        // Del opp navn i fornavn og etternavn
        const nameParts = user.name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        // Opprett primærkontakt basert på brukerinformasjonen
        const contact = await tx.customerContact.create({
          data: {
            firstName,
            lastName,
            email: user.email,
            isPrimary: true,
            position: 'Primærkontakt',
            companyId: newCompany.id
          }
        });

        // Hvis det er salesInfo i request, opprett en salgsmulighet
        let opportunity = null;
        if (body.salesInfo && newCompany.id) {
          const { potentialValue, prospectStage, expectedCloseDate, salesNotes } = body.salesInfo;
          
          if (potentialValue && potentialValue > 0) {
            opportunity = await tx.salesOpportunity.create({
              data: {
                title: `Potensial for ${newCompany.name}`,
                description: salesNotes || `Potensiell kunde: ${newCompany.name}`,
                value: potentialValue,
                stage: prospectStage || 'LEAD',
                probability: 50, // Standard sannsynlighet
                expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
                companyId: newCompany.id,
                // Tilordne oppretteren av prospekten (admin-brukeren som opprettet den)
                assignedToId: null // Dette vil settes til den som er logget inn i CRM
              }
            });
          }
        }

        return { company: newCompany, user: newUser, modules, contact, opportunity }
      })

      return new Response(JSON.stringify(result), { status: 201 })
    } catch (error) {
      console.error('Database error:', error) // Detaljert feillogging
      return new Response(
        JSON.stringify({ 
          message: 'Databasefeil ved registrering',
          error: error instanceof Error ? error.message : 'Unknown error'
        }),
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Server error:', error) // Detaljert feillogging
    return new Response(
      JSON.stringify({ 
        message: 'Serverfeil ved registrering',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500 }
    )
  }
}

// Legg til hjelpefunksjoner for å få label og beskrivelse for moduler
function getModuleLabel(key: string): string {
  const moduleLabels: Record<string, string> = {
    'HMS_HANDBOOK': 'HMS Håndbok',
    'DEVIATIONS': 'Avvikshåndtering',
    'RISK_ASSESSMENT': 'Risikovurdering',
    'DOCUMENTS': 'Dokumenthåndtering',
    'EMPLOYEES': 'Ansatthåndtering',
    'SAFETY_ROUNDS': 'Vernerunder',
    'COMPETENCE': 'Kompetansestyring',
    'SJA': 'Sikker Jobb Analyse',
    'BHT': 'Bedriftshelsetjeneste'
  }
  
  return moduleLabels[key] || key
}

function getModuleDescription(key: string): string {
  const moduleDescriptions: Record<string, string> = {
    'HMS_HANDBOOK': 'Standard HMS håndbok med tilpasninger',
    'DEVIATIONS': 'System for registrering og oppfølging av avvik',
    'RISK_ASSESSMENT': 'Verktøy for risikovurdering og tiltak',
    'DOCUMENTS': 'System for dokumenthåndtering og versjonskontroll',
    'EMPLOYEES': 'Administrasjon av ansatte og tilganger',
    'SAFETY_ROUNDS': 'Gjennomføring og oppfølging av vernerunder',
    'COMPETENCE': 'System for registrering og oppfølging av kompetanse',
    'SJA': 'Verktøy for sikker jobbanalyse',
    'BHT': 'Administrasjon av bedriftshelsetjeneste'
  }
  
  return moduleDescriptions[key] || ''
} 