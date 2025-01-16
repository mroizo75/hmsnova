import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { NextResponse } from "next/server"

// PATCH /api/hms-handbook/sections/[id]
export async function PATCH(
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

    const { content, isDraft = true } = await req.json()
    const sectionId = params.id

    const db = await prisma

    // Sjekk tilgang og oppdater innhold
    const section = await db.hMSSection.update({
      where: {
        id: sectionId,
        handbook: {
          company: {
            users: {
              some: {
                id: session.user.id
              }
            }
          }
        }
      },
      data: {
        content
      },
      include: {
        handbook: true
      }
    })

    if (!section) {
      return NextResponse.json(
        { message: "Seksjonen ble ikke funnet eller du har ikke tilgang" },
        { status: 404 }
      )
    }

    // Kun oppdater handbook.updatedAt hvis dette er en vanlig lagring
    if (isDraft) {
      await db.hMSHandbook.update({
        where: { id: section.handbookId },
        data: { updatedAt: new Date() }
      })
    }

    return NextResponse.json({ message: "Seksjon oppdatert" })
  } catch (error) {
    console.error("Error updating section:", error)
    return NextResponse.json(
      { message: "Kunne ikke oppdatere seksjonen" },
      { status: 500 }
    )
  }
}

// DELETE /api/hms-handbook/sections/[id]
export async function DELETE(
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

    const db = await prisma

    // Sjekk om brukeren har tilgang til seksjonen
    const section = await db.hMSSection.findFirst({
      where: {
        id: params.id,
        handbook: {
          company: {
            users: {
              some: {
                id: session.user.id
              }
            }
          }
        }
      },
      include: {
        handbook: true
      }
    })

    if (!section) {
      return NextResponse.json(
        { message: "Ikke tilgang til denne seksjonen" },
        { status: 403 }
      )
    }

    // Slett seksjonen (dette vil også slette alle underseksjoner pga. onDelete: Cascade)
    await db.hMSSection.delete({
      where: { id: params.id }
    })

    // Oppdater versjonsnummer på håndboken
    await db.hMSHandbook.update({
      where: { id: section.handbook.id },
      data: {
        version: {
          increment: 1
        }
      }
    })

    return NextResponse.json({ message: "Seksjon slettet" })
  } catch (error) {
    console.error("Error deleting section:", error)
    return NextResponse.json(
      { message: "Kunne ikke slette seksjon" },
      { status: 500 }
    )
  }
} 