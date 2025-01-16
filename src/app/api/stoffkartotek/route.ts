import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const produkter = await prisma.stoffkartotek.findMany({
      where: {
        companyId: session.user.companyId
      },
      select: {
        id: true,
        produktnavn: true,
        fareSymboler: {
          select: {
            symbol: true
          }
        }
      },
      orderBy: {
        produktnavn: 'asc'
      }
    })

    return NextResponse.json(produkter)
  } catch (error) {
    console.error("Error fetching stoffkartotek:", error)
    return NextResponse.json(
      { error: "Kunne ikke hente stoffkartotek" },
      { status: 500 }
    )
  }
} 