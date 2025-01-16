import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { NextResponse } from "next/server"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Ikke autorisert" },
        { status: 401 }
      )
    }

    const { changes, reason } = await req.json()
    const handbookId = params.id

    const db = await prisma

    // Hent nåværende håndbok med alle seksjoner
    const handbook = await db.hMSHandbook.findFirst({
      where: {
        id: handbookId,
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
          include: {
            subsections: true
          }
        }
      }
    })

    if (!handbook) {
      return NextResponse.json(
        { message: "Håndbok ikke funnet eller ingen tilgang" },
        { status: 404 }
      )
    }

    // Opprett ny release og oppdater versjonsnummer
    await db.$transaction([
      db.hMSRelease.create({
        data: {
          version: handbook.version + 1,
          handbookId: handbook.id,
          changes,
          reason,
          approvedBy: session.user.id,
          content: handbook.sections // Lagre snapshot av innholdet
        }
      }),
      db.hMSHandbook.update({
        where: { id: handbook.id },
        data: {
          version: handbook.version + 1
        }
      })
    ])

    return NextResponse.json({ message: "Ny versjon publisert" })
  } catch (error) {
    console.error("Error creating release:", error)
    return NextResponse.json(
      { message: "Kunne ikke publisere ny versjon" },
      { status: 500 }
    )
  }
} 