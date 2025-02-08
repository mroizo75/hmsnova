import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"

// POST /api/equipment/[id]/documents - Last opp nytt dokument
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const data = await req.json()

    const document = await prisma.equipmentDocument.create({
      data: {
        ...data,
        equipmentId: params.id
      }
    })

    return NextResponse.json(document)
  } catch (error) {
    console.error('Error uploading document:', error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 