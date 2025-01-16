import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10 // Begrens til de 10 siste varslene
    })

    return NextResponse.json(notifications)
  } catch (error) {
    return NextResponse.json(
      { error: "Kunne ikke hente varsler" },
      { status: 500 }
    )
  }
} 