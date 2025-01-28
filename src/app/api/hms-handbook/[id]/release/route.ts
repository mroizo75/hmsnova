import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { requireAuth } from "@/lib/utils/auth"
import { z } from "zod"

const releaseSchema = z.object({
  changes: z.string(),
  reason: z.string(),
})

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth()
    const handbookId = params.id
    const data = await request.json()
    const { changes, reason } = releaseSchema.parse(data)

    // 1. Hent nåværende håndbok med alle seksjoner
    const handbook = await prisma.hMSHandbook.findFirst({
      where: {
        id: handbookId,
        companyId: session.user.companyId,
      },
      include: {
        sections: {
          include: {
            changes: true
          }
        }
      }
    })

    if (!handbook) {
      return NextResponse.json(
        { error: "Håndbok ikke funnet" },
        { status: 404 }
      )
    }

    // 2. Opprett ny release med snapshot av håndboken
    const release = await prisma.hMSRelease.create({
      data: {
        version: handbook.version + 1,
        handbookId: handbookId,
        changes: changes,
        reason: reason,
        approvedBy: session.user.id,
        content: handbook, // Snapshot av hele håndboken
      }
    })

    // 3. Oppdater håndbokens versjonsnummer
    await prisma.hMSHandbook.update({
      where: { id: handbookId },
      data: { 
        version: handbook.version + 1,
        published: true
      }
    })

    return NextResponse.json(release)
  } catch (error) {
    console.error("Error creating release:", error)
    return NextResponse.json(
      { error: "Kunne ikke opprette ny versjon" },
      { status: 500 }
    )
  }
} 