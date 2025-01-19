import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"

interface RouteParams {
  params: Promise<{ 
    id: string
    vedleggId: string 
  }>
}

export async function GET(
  request: Request,
  context: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const { id, vedleggId } = await context.params

    const vedlegg = await prisma.sJAVedlegg.findFirst({
      where: {
        id: vedleggId,
        sjaId: id,
        sja: {
          companyId: session.user.companyId
        }
      }
    })

    if (!vedlegg) {
      return NextResponse.json({ error: "Vedlegg ikke funnet" }, { status: 404 })
    }

    return NextResponse.json(vedlegg)
  } catch (error) {
    console.error("Error fetching vedlegg:", error)
    return NextResponse.json(
      { error: "Kunne ikke hente vedlegg" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  context: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const { id, vedleggId } = await context.params

    // Sjekk tilgang til SJA
    const sja = await prisma.sJA.findFirst({
      where: {
        id,
        companyId: session.user.companyId
      }
    })

    if (!sja) {
      return NextResponse.json({ error: "SJA ikke funnet" }, { status: 404 })
    }

    // Slett vedlegget
    await prisma.sJAVedlegg.delete({
      where: {
        id: vedleggId,
        sjaId: id
      }
    })

    // Logg slettingen
    await prisma.auditLog.create({
      data: {
        action: "DELETE_SJA_VEDLEGG",
        entityType: "SJA_VEDLEGG",
        entityId: vedleggId,
        userId: session.user.id,
        companyId: session.user.companyId,
        details: {
          sjaId: id
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting vedlegg:", error)
    return NextResponse.json(
      { error: "Kunne ikke slette vedlegg" },
      { status: 500 }
    )
  }
} 