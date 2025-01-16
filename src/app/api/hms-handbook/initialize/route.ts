import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { NextResponse } from "next/server"

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
        sections: true,
        company: true
      }
    })

    if (!handbook) {
      return NextResponse.json(
        { message: "Ingen HMS-håndbok funnet" },
        { status: 404 }
      )
    }

    if (handbook.sections.length > 0) {
      return NextResponse.json(
        { message: "HMS-håndboken har allerede seksjoner" },
        { status: 400 }
      )
    }

    // Opprett standardseksjoner
    const defaultSections = [
      { 
        title: "1. Innledning", 
        content: JSON.stringify({
          type: "doc",
          content: [{ type: "paragraph", content: [{ type: "text", text: `HMS-håndbok for ${handbook.company.name}` }] }]
        })
      },
      { 
        title: "2. HMS-mål", 
        content: JSON.stringify({
          type: "doc",
          content: [{ type: "paragraph", content: [{ type: "text", text: "Våre HMS-mål og strategier" }] }]
        })
      },
      { 
        title: "3. Organisering", 
        content: JSON.stringify({
          type: "doc",
          content: [{ type: "paragraph", content: [{ type: "text", text: "Organisering av HMS-arbeidet" }] }]
        })
      },
      { 
        title: "4. Rutiner", 
        content: JSON.stringify({
          type: "doc",
          content: [{ type: "paragraph", content: [{ type: "text", text: "HMS-rutiner og prosedyrer" }] }]
        })
      },
      { 
        title: "5. Beredskap", 
        content: JSON.stringify({
          type: "doc",
          content: [{ type: "paragraph", content: [{ type: "text", text: "Beredskapsplan og rutiner" }] }]
        })
      }
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

    return NextResponse.json({ message: "Standardseksjoner opprettet" })
  } catch (error) {
    console.error("Error initializing handbook:", error)
    return NextResponse.json(
      { message: "Kunne ikke initialisere HMS-håndbok" },
      { status: 500 }
    )
  }
} 