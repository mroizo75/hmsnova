import prisma from '@/lib/db'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  createdAt: Date
  readAt?: Date
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
      data: { readAt: new Date() }
    })
  }
} 