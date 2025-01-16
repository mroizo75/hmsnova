import prisma from "@/lib/db"
import { NotificationType } from "@prisma/client"
import { getIO } from "@/lib/socket"

interface NotificationData {
  type: NotificationType
  title: string
  message: string
  userId: string
  metadata?: any
}

export async function createNotification({
  type,
  title,
  message,
  userId,
  metadata
}: NotificationData) {
  try {
    console.log('Creating notification:', { type, title, message, userId, metadata })
    
    // Sjekk brukerens varslingsinnstillinger
    const settings = await prisma.notificationSettings.findUnique({
      where: { userId }
    })

    console.log('User notification settings:', settings)

    // Sjekk om brukeren skal motta denne typen varsling
    const shouldNotify = settings && (
      (type === 'DEVIATION_CREATED' && settings.deviationCreated) ||
      (type === 'DEVIATION_ASSIGNED' && settings.deviationAssigned) ||
      (type === 'SJA_CREATED' && settings.sjaCreated) ||
      (type === 'SJA_ASSIGNED' && settings.sjaAssigned) ||
      (type === 'SJA_APPROVED' && settings.sjaCreated) ||
      (type === 'SJA_REJECTED' && settings.sjaCreated)
    )

    if (!shouldNotify) {
      console.log('Notification skipped based on user settings')
      return null
    }

    const notification = await prisma.notification.create({
      data: {
        type,
        title,
        message,
        userId,
        metadata: metadata || {}
      }
    })

    // Send WebSocket notifications
    const io = getIO()
    if (io) {
      // Send til spesifikk bruker
      io.to(`user-${userId}`).emit('notification', notification)

      // Send event for dashboard oppdateringer
      if (type === 'DEVIATION_CREATED') {
        io.to(`company-${metadata.companyId}`).emit('deviation:created', {
          id: metadata.deviationId,
          title: metadata.title,
          status: metadata.status,
          severity: metadata.severity,
          createdAt: new Date(),
          reportedBy: {
            name: metadata.reportedByName,
            email: metadata.reportedByEmail
          }
        })
      }

      if (type === 'SJA_CREATED') {
        io.to(`company-${metadata.companyId}`).emit('sja:created', {
          id: metadata.sjaId,
          title: metadata.title,
          startDate: metadata.startDate,
          location: metadata.location
        })
      }
    }

    // Send e-postvarsling hvis aktivert
    if (settings?.emailNotifications && settings.emailDigestFrequency === 'INSTANT') {
      await sendEmailNotification({
        userId,
        notification
      })
    }

    return notification
  } catch (error) {
    console.error('Error creating notification:', error)
    throw error
  }
}

async function sendEmailNotification({ userId, notification }: { 
  userId: string, 
  notification: any 
}) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  if (!user?.email) return

  // Legg til i e-postkøen
  await prisma.emailQueue.create({
    data: {
      userId,
      type: 'NOTIFICATION',
      payload: {
        notificationId: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message
      }
    }
  })
}

export async function getUnreadNotifications(userId: string) {
  return prisma.notification.findMany({
    where: {
      userId,
      isRead: false
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

export async function markNotificationAsRead(id: string) {
  return prisma.notification.update({
    where: { id },
    data: { isRead: true }
  })
} 