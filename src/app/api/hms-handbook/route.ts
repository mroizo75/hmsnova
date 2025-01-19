import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { NextResponse } from "next/server"

// POST /api/hms-handbook
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Ikke autorisert" },
        { status: 401 }
      )
    }

    const db = await prisma

    // Finn brukerens bedrift
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { company: true }
    })

    console.log("User:", user) // Debug logging

    if (!user?.company) {
      return NextResponse.json(
        { message: "Ingen bedrift funnet" },
        { status: 404 }
      )
    }

    // Sjekk om bedriften allerede har en håndbok
    const existingHandbook = await db.hMSHandbook.findFirst({
      where: { companyId: user.company.id }
    })

    console.log("Existing handbook:", existingHandbook) // Debug logging

    if (existingHandbook) {
      return NextResponse.json(
        { message: "Bedriften har allerede en HMS-håndbok" },
        { status: 400 }
      )
    }

    // Opprett ny håndbok med try-catch for å fange databasefeil
    try {
      const handbook = await db.hMSHandbook.create({
        data: {
          title: "HMS-håndbok",
          companyId: user.company.id,
          version: 1
        }
      })

      // Opprett standardseksjoner
      const defaultSections = [
        { 
          title: "1. Innledning", 
          content: JSON.stringify({
            type: "doc",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: `HMS-håndbok for ${user.company.name}`
                  }
                ]
              }
            ]
          })
        },
        { title: "2. HMS-mål", content: "<p>Våre HMS-mål og strategier</p>" },
        { title: "3. Organisering", content: "<p>Organisering av HMS-arbeidet</p>" },
        { title: "4. Rutiner", content: "<p>HMS-rutiner og prosedyrer</p>" },
        { title: "5. Beredskap", content: "<p>Beredskapsplan og rutiner</p>" }
      ]

      for (const section of defaultSections) {
        await db.hMSSection.create({
          data: {
            title: section.title,
            content: section.content,
            order: defaultSections.indexOf(section) + 1,
            handbookId: handbook.id
          }
        })
      }

      return NextResponse.json(handbook, { status: 201 })
    } catch (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json(
        { message: "Databasefeil ved opprettelse av håndbok" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error in HMS handbook creation:", error)
    return NextResponse.json(
      { 
        message: "Kunne ikke opprette HMS-håndbok",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

// GET /api/hms-handbook
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Ikke autorisert" },
        { status: 401 }
      )
    }

    const db = await prisma
    
    const handbook = await db.hMSHandbook.findFirst({
      where: {
        company: {
          users: {
            some: {
              id: session.user.id
            }
          }
        }
      },
      include: {
        sections: {
          orderBy: {
            order: 'asc'
          },
          include: {
            subsections: {
              orderBy: {
                order: 'asc'
              }
            }
          }
        }
      }
    })

    if (!handbook) {
      return NextResponse.json(
        { message: "Ingen HMS-håndbok funnet" },
        { status: 404 }
      )
    }

    return NextResponse.json(handbook)
  } catch (error) {
    console.error("Error fetching handbook:", error)
    return NextResponse.json(
      { message: "Kunne ikke hente HMS-håndbok" },
      { status: 500 }
    )
  }
} 