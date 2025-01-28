import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const mal = await prisma.sJAMal.findUnique({
      where: {
        id: params.id,
        companyId: session.user.companyId
      },
      include: {
        risikoer: true,
        tiltak: true
      }
    })

    if (!mal) {
      return NextResponse.json({ error: "Mal ikke funnet" }, { status: 404 })
    }

    return NextResponse.json(mal)
  } catch (error) {
    console.error("Feil ved henting av SJA-mal:", error)
    return NextResponse.json(
      { error: "Kunne ikke hente SJA-mal" },
      { status: 500 }
    )
  }
} 