import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    let body
    try {
      const rawBody = await req.text()
      console.log('Request body:', rawBody)
      body = rawBody ? JSON.parse(rawBody) : {}
      console.log('Parsed body:', body)
    } catch (e) {
      console.error('Error parsing request body:', e)
      return NextResponse.json({ 
        message: "Invalid JSON",
        error: e instanceof Error ? e.message : 'Unknown error'
      }, { status: 400 })
    }

    const { changeId, changeIds } = body
    
    if (!changeId && !changeIds) {
      return NextResponse.json({ 
        message: "Missing changeId or changeIds",
        receivedBody: body 
      }, { status: 400 })
    }

    // Sjekk om seksjonen eksisterer og tilhører riktig bedrift
    const section = await prisma.hMSSection.findFirst({
      where: { 
        id: params.id,
        handbook: {
          company: {
            id: session.user.companyId
          }
        }
      }
    })

    if (!section) {
      return NextResponse.json({ message: "Section not found" }, { status: 404 })
    }

    if (changeId) {
      // Håndter enkelt endring
      const updatedChange = await prisma.hMSChange.update({
        where: { 
          id: changeId,
          companyId: session.user.companyId
        },
        data: {
          sectionId: params.id
        },
        include: {
          section: true
        }
      })
      return NextResponse.json(updatedChange)
    } else {
      // Håndter flere endringer
      const updatedChanges = await prisma.$transaction(
        changeIds.map((id: string) => 
          prisma.hMSChange.update({
            where: { 
              id,
              companyId: session.user.companyId
            },
            data: {
              sectionId: params.id
            },
            include: {
              section: true
            }
          })
        )
      )
      return NextResponse.json(updatedChanges)
    }
  } catch (error) {
    console.error("Error adding change to section:", error)
    return NextResponse.json(
      { message: "Internal Server Error", error: String(error) }, 
      { status: 500 }
    )
  }
} 