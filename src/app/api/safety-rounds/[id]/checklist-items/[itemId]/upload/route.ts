import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { uploadToStorage } from "@/lib/storage"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: Request,
  { params }: { params: { id: string, itemId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

    const formData = await req.formData()
    const file = formData.get("file") as File
    if (!file) return new NextResponse("No file provided", { status: 400 })

    const imageUrl = await uploadToStorage(
      file, 
      `safety-rounds/${params.id}/checklist-items/${params.itemId}/${file.name}`,
      session.user.companyId
    )

    // Lagre bilde i databasen
    const image = await prisma.safetyRoundImage.create({
      data: {
        url: imageUrl,
        safetyRoundId: params.id,
        uploadedById: session.user.id,
        findingId: null
      }
    })

    return NextResponse.json({ imageUrl: image.url })
  } catch (error) {
    console.error("Error uploading image:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 