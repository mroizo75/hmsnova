import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const change = await prisma.hMSChange.update({
      where: { id: params.id },
      data: {
        status: "COMPLETED",
        implementedAt: new Date(),
      }
    })

    // Opprett en ny versjon av HMS-håndboken
    await prisma.hMSRelease.create({
      data: {
        handbookId: change.sectionId, // Kobling til riktig håndbok
        version: 1, // Increment version
        changes: `Implementert endring: ${change.title}`,
        reason: change.description,
        approvedBy: session.user.id,
        content: {} // Legg til nødvendig innhold
      }
    })

    return NextResponse.json(change)
  } catch (error) {
    console.error("Error implementing HMS change:", error)
    return NextResponse.json(
      { error: "Kunne ikke implementere HMS-endring" },
      { status: 500 }
    )
  }
} 