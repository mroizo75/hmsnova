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
    website: z.string().optional(),
    subscriptionPlan: z.enum(["STANDARD", "STANDARD_PLUS", "PREMIUM"]),
    employeeCount: z.string(),
    storageSize: z.string(),
    includeVernerunde: z.enum(["yes", "no"]).optional()
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

    const { company, user, subscriptionPlan, employeeCount, storageSize, includeVernerunde } = body

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
            ...company,
            subscriptionPlan,
            employeeCount: getEmployeeCount(employeeCount),
            storageLimit: getStorageLimit(storageSize),
            includeVernerunde: includeVernerunde === "yes" || subscriptionPlan === "PREMIUM",
            vernerundeDate: null // Dato settes når første vernerunde gjennomføres
          }
        })

        // Opprett moduler separat med unike nøkler
        const modules = await Promise.all([
          tx.module.create({
            data: {
              key: `HMS_HANDBOOK_${newCompany.id}`,
              label: "HMS Håndbok",
              description: "Standard HMS håndbok med tilpasninger",
              isActive: true,
              isDefault: true,
              companyId: newCompany.id
            }
          }),
          tx.module.create({
            data: {
              key: `DEVIATIONS_${newCompany.id}`,
              label: "Avvikshåndtering",
              description: "System for registrering og oppfølging av avvik",
              isActive: true,
              isDefault: true,
              companyId: newCompany.id
            }
          }),
          tx.module.create({
            data: {
              key: `RISK_ASSESSMENT_${newCompany.id}`,
              label: "Risikovurdering",
              description: "Verktøy for risikovurdering og tiltak",
              isActive: true,
              isDefault: true,
              companyId: newCompany.id
            }
          }),
          tx.module.create({
            data: {
              key: `DOCUMENTS_${newCompany.id}`,
              label: "Dokumenthåndtering",
              description: "System for dokumenthåndtering og versjonskontroll",
              isActive: true,
              isDefault: true,
              companyId: newCompany.id
            }
          }),
          tx.module.create({
            data: {
              key: `EMPLOYEES_${newCompany.id}`,
              label: "Ansatthåndtering",
              description: "Administrasjon av ansatte og tilganger",
              isActive: true,
              isDefault: true,
              companyId: newCompany.id
            }
          })
        ])

        // Opprett bruker
        const hashedPassword = await bcrypt.hash(user.password, 10)
        const newUser = await tx.user.create({
          data: {
            ...user,
            password: hashedPassword,
            companyId: newCompany.id,
          },
        })

        return { company: newCompany, user: newUser, modules }
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