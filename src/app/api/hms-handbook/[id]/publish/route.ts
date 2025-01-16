import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'SUPPORT'].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const handbook = await prisma.hMSHandbook.update({
      where: {
        id: params.id
      },
      data: {
        published: true,
        publishedAt: new Date()
      }
    })

    return NextResponse.json(handbook)
  } catch (error) {
    console.error("Error publishing handbook:", error)
    return NextResponse.json({ 
      error: "Kunne ikke publisere HMS-håndbok",
      details: error instanceof Error ? error.message : 'Ukjent feil'
    }, { 
      status: 500 
    })
  }
} 