import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"

export async function POST(
  req: Request,
  { params }: { params: { id: string, itemId: string } }
) {
  try {
    const { imageUrl } = await req.json()
    const session = await getServerSession(authOptions)
    
    const image = await prisma.safetyRoundImage.create({
      data: {
        url: imageUrl,
        safetyRoundId: params.id,
        checklistItemId: params.itemId,
        uploadedById: session?.user?.id || ''
      }
    })

    return NextResponse.json(image)
  } catch (error) {
    console.error('Error saving image:', error)
    return new NextResponse("Error saving image", { status: 500 })
  }
} 