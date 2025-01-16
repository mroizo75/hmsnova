import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { uploadToStorage } from "@/lib/storage"

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const { id: deviationId } = await context.params

    // Sjekk om avviket eksisterer og tilhører brukerens bedrift
    const deviation = await prisma.deviation.findFirst({
      where: {
        id: deviationId,
        company: {
          users: {
            some: {
              id: session.user.id
            }
          }
        }
      }
    })

    if (!deviation) {
      return NextResponse.json({ error: "Avvik ikke funnet" }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const caption = formData.get("caption") as string

    if (!file) {
      return NextResponse.json({ error: "Ingen fil mottatt" }, { status: 400 })
    }

    // Generer en unik filsti for bildet
    const fileExtension = file.name.split('.').pop()
    const fileName = `companies/${session.user.companyId}/deviations/${deviationId}/${Date.now()}.${fileExtension}`

    // Last opp til Google Cloud Storage
    await uploadToStorage(file, fileName)

    // Lagre bare filstien i databasen, ikke hele URL-en
    const image = await prisma.deviationImage.create({
      data: {
        url: fileName,  // Bare filstien, ikke hele URL-en
        caption,
        deviationId,
        uploadedBy: session.user.id
      }
    })

    return NextResponse.json(image)

  } catch (error) {
    console.error("Error uploading image:", error)
    return NextResponse.json(
      { error: "Kunne ikke laste opp bilde" },
      { status: 500 }
    )
  }
} 