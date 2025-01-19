import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(
  request: Request,
  context: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'SUPPORT'].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const { sections } = await request.json()

    // Oppdater rekkefølgen på alle seksjoner
    await Promise.all(
      sections.map((section: { id: string; order: number }) =>
        prisma.hMSTemplateSection.update({
          where: {
            id: section.id,
            templateId: id
          },
          data: {
            order: section.order,
            lastEditedBy: session.user.id,
            lastEditedAt: new Date()
          }
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reordering sections:', error)
    return NextResponse.json(
      { error: "Kunne ikke oppdatere rekkefølgen" },
      { status: 500 }
    )
  }
} 