import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { requireAuth } from "@/lib/utils/auth"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(
  request: Request,
  context: RouteParams
) {
  try {
    const session = await requireAuth()
    const { id } = await context.params

    // Sjekk om varselet eksisterer og tilhører brukeren
    const notification = await prisma.notification.findUnique({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!notification) {
      return NextResponse.json({ error: "Varsel ikke funnet" }, { status: 404 })
    }

    // Marker varselet som lest
    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: {
        read: true
      }
    })

    // Logg handlingen
    await prisma.auditLog.create({
      data: {
        action: "READ_NOTIFICATION",
        entityType: "NOTIFICATION",
        entityId: id,
        userId: session.user.id,
        companyId: session.user.companyId,
        details: {
          type: notification.type,
          read: updatedNotification.read
        }
      }
    })

    return NextResponse.json(updatedNotification)
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return NextResponse.json(
      { error: "Kunne ikke markere varsel som lest" },
      { status: 500 }
    )
  }
} 