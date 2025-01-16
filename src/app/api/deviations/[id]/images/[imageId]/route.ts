import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { deleteFromStorage } from "@/lib/storage"

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const { id: deviationId, imageId } = await context.params

    // Finn bildet og sjekk tilgang
    const image = await prisma.deviationImage.findFirst({
      where: {
        id: imageId,
        deviationId,
        deviation: {
          company: {
            users: {
              some: {
                id: session.user.id
              }
            }
          }
        }
      }
    })

    if (!image) {
      return NextResponse.json({ error: "Bilde ikke funnet" }, { status: 404 })
    }

    // Slett fra Google Cloud Storage
    await deleteFromStorage(image.url)

    // Slett fra databasen
    await prisma.deviationImage.delete({
      where: {
        id: imageId
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Error deleting image:", error)
    return NextResponse.json(
      { error: "Kunne ikke slette bilde" },
      { status: 500 }
    )
  }
} 