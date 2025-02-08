import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSignedUrl } from "@/lib/storage"

export async function GET(
  req: Request,
  { params }: { params: { id: string, itemId: string } }
) {
  try {
    console.log('Fetching images for:', {
      safetyRoundId: params.id,
      checklistItemId: params.itemId
    })

    // Først, la oss sjekke alle bilder for denne vernerunden
    const allImages = await prisma.safetyRoundImage.findMany({
      where: {
        safetyRoundId: params.id
      }
    })
    console.log('All images for safety round:', allImages)

    const images = await prisma.safetyRoundImage.findMany({
      where: {
        OR: [
          {
            safetyRoundId: params.id,
            checklistItemId: params.itemId
          },
          {
            safetyRoundId: params.id,
            checklistItemId: null
          }
        ]
      }
    })

    // Fjern duplikater og behold bare det nyeste bildet med samme URL
    const uniqueImages = images.reduce((acc, current) => {
      const existingImage = acc.find(item => item.url === current.url)
      if (!existingImage || current.createdAt > existingImage.createdAt) {
        // Fjern det gamle bildet hvis det finnes
        if (existingImage) {
          acc = acc.filter(img => img.id !== existingImage.id)
          // Slett det gamle bildet fra databasen
          prisma.safetyRoundImage.delete({
            where: { id: existingImage.id }
          }).catch(console.error)
        }
        return [...acc, current]
      }
      // Slett det nyere duplikatet fra databasen
      prisma.safetyRoundImage.delete({
        where: { id: current.id }
      }).catch(console.error)
      return acc
    }, [] as typeof images)

    const imagesWithUrls = await Promise.all(
      uniqueImages.map(async (image) => {
        try {
          const fullUrl = await getSignedUrl(image.url)
          return { ...image, fullUrl }
        } catch (error) {
          // Bildet finnes ikke i storage, slett fra database
          await prisma.safetyRoundImage.delete({
            where: { id: image.id }
          }).catch(console.error)
          return null
        }
      })
    )

    const validImages = imagesWithUrls.filter((img): img is typeof imagesWithUrls[0] => img !== null)
    return NextResponse.json(validImages)
  } catch (error) {
    console.error('Error fetching images:', error)
    return new NextResponse("Error fetching images", { status: 500 })
  }
} 