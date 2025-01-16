import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const notification = await prisma.notification.update({
      where: {
        id: params.id,
        userId: session.user.id
      },
      data: {
        read: true
      }
    })

    return NextResponse.json(notification)
  } catch (error) {
    return NextResponse.json(
      { error: "Kunne ikke oppdatere varsel" },
      { status: 500 }
    )
  }
} 