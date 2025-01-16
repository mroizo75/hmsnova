import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import bcrypt from "bcryptjs"
import { z } from "zod"

// Valideringsskjema
const registerSchema = z.object({
  company: z.object({
    orgNumber: z.string(),
    name: z.string(),
    organizationType: z.string(),
    organizationCode: z.string(),
    website: z.string().optional()
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
    const data = await req.json()
    const validatedData = registerSchema.parse(data)

    // Start en database transaksjon
    const result = await prisma.$transaction(async (tx) => {
      // 1. Opprett bedriften
      const company = await tx.company.create({
        data: {
          ...validatedData.company,
          modules: {
            create: [
              // Standard moduler som alltid skal være med
              {
                key: "HMS_HANDBOOK",
                label: "HMS Håndbok",
                description: "Standard HMS håndbok med tilpasninger",
                isActive: true,
                isDefault: true
              },
              {
                key: "DEVIATIONS",
                label: "Avvikshåndtering",
                description: "System for registrering og oppfølging av avvik",
                isActive: true,
                isDefault: true
              },
              {
                key: "RISK_ASSESSMENT",
                label: "Risikovurdering",
                description: "Verktøy for risikovurdering og tiltak",
                isActive: true,
                isDefault: true
              },
              {
                key: "DOCUMENTS",
                label: "Dokumenthåndtering",
                description: "System for dokumenthåndtering og versjonskontroll",
                isActive: true,
                isDefault: true
              },
              {
                key: "EMPLOYEES",
                label: "Ansatthåndtering",
                description: "Administrasjon av ansatte og tilganger",
                isActive: true,
                isDefault: true
              }
            ]
          }
        }
      })

      // 2. Opprett brukeren
      const hashedPassword = await bcrypt.hash(validatedData.user.password, 10)
      const user = await tx.user.create({
        data: {
          ...validatedData.user,
          password: hashedPassword,
          companyId: company.id
        }
      })

      return { company, user }
    })

    return NextResponse.json({
      message: 'Registrering vellykket',
      company: {
        id: result.company.id,
        name: result.company.name
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Valideringsfeil', errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Kunne ikke registrere bedrift' },
      { status: 500 }
    )
  }
} 