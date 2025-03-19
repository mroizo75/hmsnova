import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"

// Definer tilgjengelige moduler (flytt dette til en egen config-fil senere)
const MODULE_CONFIG = {
  HMS_HANDBOOK: {
    label: "HMS Håndbok",
    description: "Standard HMS håndbok med tilpasninger",
    isDefault: true
  },
  DEVIATIONS: {
    label: "Avvikshåndtering",
    description: "System for registrering og oppfølging av avvik",
    isDefault: true
  },
  RISK_ASSESSMENT: {
    label: "Risikovurdering",
    description: "Verktøy for risikovurdering og tiltak",
    isDefault: true
  },
  DOCUMENTS: {
    label: "Dokumenthåndtering",
    description: "System for dokumenthåndtering og versjonskontroll",
    isDefault: true
  },
  EMPLOYEES: {
    label: "Ansatthåndtering",
    description: "Administrasjon av ansatte og tilganger",
    isDefault: true
  },
  SAFETY_ROUNDS: {
    label: "Vernerunder",
    description: "Planlegging og gjennomføring av vernerunder",
    isDefault: false
  },
  HMS_CONSULTING: {
    label: "HMS Rådgivning",
    description: "Tilgang til HMS-rådgivning og support",
    isDefault: false
  },
  COMPETENCE: {
    label: "Kompetansestyring",
    description: "System for registrering og oppfølging av kompetanse, kurs og sertifiseringer",
    isDefault: false
  }
} as const

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET-rute for å hente moduler
export async function GET(
  request: Request,
  context: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !['ADMIN', 'SUPPORT'].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: companyId } = await context.params

    const modules = await prisma.module.findMany({
      where: { companyId }
    })

    return NextResponse.json({ modules })
  } catch (error) {
    return NextResponse.json(
      { error: "Kunne ikke hente moduler" }, 
      { status: 500 }
    )
  }
}

// PATCH-rute for å oppdatere moduler
export async function PATCH(
  request: Request,
  context: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !['ADMIN', 'SUPPORT'].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: companyId } = await context.params
    const { moduleKey, active } = await request.json()

    // Valider input
    if (!moduleKey || typeof active !== 'boolean') {
      return NextResponse.json(
        { error: "Ugyldig input" },
        { status: 400 }
      )
    }

    // Sjekk om modulen eksisterer i konfigurasjonen
    const moduleConfig = MODULE_CONFIG[moduleKey as keyof typeof MODULE_CONFIG]
    if (!moduleConfig) {
      return NextResponse.json(
        { error: "Ugyldig modul" },
        { status: 400 }
      )
    }

    if (active) {
      // Sjekk om modulen allerede eksisterer
      const existingModule = await prisma.module.findFirst({
        where: {
          companyId,
          key: moduleKey
        }
      })

      if (!existingModule) {
        try {
          // Opprett ny modul med konfigurasjon
          await prisma.module.create({
            data: {
              key: moduleKey,
              label: moduleConfig.label,
              description: moduleConfig.description,
              isActive: true,
              isDefault: moduleConfig.isDefault,
              companyId
            }
          })
        } catch (dbError) {
          console.error('Database error:', dbError)
          return NextResponse.json(
            { error: "Kunne ikke opprette modul" },
            { status: 500 }
          )
        }
      }
    } else {
      try {
        // Deaktiver modul
        await prisma.module.deleteMany({
          where: {
            key: moduleKey,
            companyId
          }
        })
      } catch (dbError) {
        console.error('Database error:', dbError)
        return NextResponse.json(
          { error: "Kunne ikke deaktivere modul" },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    // Mer detaljert feilhåndtering
    const errorMessage = error instanceof Error ? error.message : "Ukjent feil"
    console.error('Error updating modules:', errorMessage)
    
    return NextResponse.json(
      { error: "Kunne ikke oppdatere moduler" },
      { status: 500 }
    )
  }
} 