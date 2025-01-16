import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'SUPPORT'].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { sections } = body

    // Oppdater rekkefølgen for alle seksjoner
    await Promise.all(
      sections.map(({ id, order }) =>
        prisma.hMSTemplateSection.update({
          where: { id },
          data: { order }
        })
      )
    )

    return NextResponse.json({ message: "Rekkefølge oppdatert" })
  } catch (error) {
    console.error('Error reordering sections:', error)
    return NextResponse.json(
      { error: "Kunne ikke oppdatere rekkefølgen" },
      { status: 500 }
    )
  }
} 