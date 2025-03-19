import prisma from '@/lib/db'
import { NotificationType } from '@prisma/client'

export interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  createdAt: Date
  readAt?: Date
  link?: string
}

interface CreateNotificationParams {
  userId: string
  type: NotificationType
  title: string
  message: string
  link?: string
}

export const createNotification = async (params: CreateNotificationParams) => {
  const { userId, type, title, message, link } = params
  return await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      link
    }
  })
}

export const notificationService = {
  async getNotifications(userId: string): Promise<Notification[]> {
    const db = prisma
    return db.notification.findMany({
      where: { userId }
    }) as Promise<Notification[]>
  },
  
  async markAsRead(notificationId: string): Promise<void> {
    const db = await prisma
    await db.notification.update({
      where: { id: notificationId },
      data: { read: true }
    })
  },

  createNotification
} 