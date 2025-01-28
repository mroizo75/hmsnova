import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { requireAuth } from "@/lib/utils/auth"

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth()
    
    const notification = await prisma.notification.delete({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    return NextResponse.json(notification)
  } catch (error) {
    console.error('Error deleting notification:', error)
    return NextResponse.json(
      { error: 'Kunne ikke slette varsel' },
      { status: 500 }
    )
  }
} 