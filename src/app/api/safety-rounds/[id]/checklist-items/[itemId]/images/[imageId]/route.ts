import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { deleteFromStorage } from "@/lib/storage"

export async function DELETE(
  req: Request,
  { params }: { params: { id: string, itemId: string, imageId: string } }
) {
  try {
    // Finn bildet først
    const image = await prisma.safetyRoundImage.findUnique({
      where: { id: params.imageId }
    })

    if (!image) {
      return new NextResponse("Image not found", { status: 404 })
    }

    // Slett fra storage
    await deleteFromStorage(image.url)

    // Slett fra database
    await prisma.safetyRoundImage.delete({
      where: { id: params.imageId }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting image:', error)
    return new NextResponse("Error deleting image", { status: 500 })
  }
} 