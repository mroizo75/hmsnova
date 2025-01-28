import prisma from "@/lib/db"
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/utils/auth"

// Hjelpefunksjon for å finne neste order-nummer
async function getNextOrder(handbookId: string, parentId: string | null) {
  const maxOrder = await prisma.hMSSection.findFirst({
    where: {
      handbookId,
      parentId: parentId || null
    },
    orderBy: {
      order: 'desc'
    },
    select: {
      order: true
    }
  })

  return (maxOrder?.order || 0) + 1
}

// POST /api/hms-handbook/sections
export async function POST(request: Request) {
  try {
    const session = await requireAuth()
    const data = await request.json()

    // Opprett ny seksjon
    const section = await prisma.hMSSection.create({
      data: {
        title: data.title,
        content: data.content,
        handbookId: data.handbookId,
        parentId: data.parentId || null,  // Gjør parentId valgfri
        order: await getNextOrder(data.handbookId, data.parentId)
      }
    })

    // Ikke oppdater versjonsnummer på håndboken
    // Ikke opprett release

    return NextResponse.json(section)
  } catch (error) {
    console.error("Error creating section:", error)
    return NextResponse.json(
      { error: "Kunne ikke opprette seksjon" },
      { status: 500 }
    )
  }
} 