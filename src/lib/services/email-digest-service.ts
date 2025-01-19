import prisma from "@/lib/db"
import { formatDate } from "@/lib/utils/date"
import sendEmail from '@/lib/email'

interface DigestNotification {
  id: string
  type: string
  title: string
  message: string
  createdAt: Date
  metadata: any
}

export async function sendDailyDigest() {
  try {
    // Finn alle brukere som har valgt daglig digest
    const users = await prisma.user.findMany({
      where: {
        notificationSettings: {
          emailNotifications: true,
          emailDigestFrequency: 'DAILY'
        }
      },
      include: {
        notificationSettings: true
      }
    })

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    for (const user of users) {
      // Hent uleste varsler for brukeren fra siste 24 timer
      const notifications = await prisma.notification.findMany({
        where: {
          userId: user.id,
          createdAt: {
            gte: yesterday
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      if (notifications.length === 0) continue

      // Grupper varsler etter type
      const groupedNotifications = groupNotificationsByType(notifications)
      
      // Generer e-postinnhold
      const emailContent = generateDigestEmail(groupedNotifications)

      // Send e-post
      await sendEmail({
        to: user.email!,
        subject: `Daglig HMS-oppsummering - ${formatDate(new Date())}`,
        html: emailContent
      })

      // Marker varsler som sendt i digest
      await prisma.notification.updateMany({
        where: {
          id: {
            in: notifications.map(n => n.id)
          }
        },
        data: {
          metadata: {
            digestSentAt: new Date()
          }
        }
      })
    }
  } catch (error) {
    console.error('Error sending daily digest:', error)
    throw error
  }
}

export async function sendWeeklyDigest() {
  try {
    // Finn alle brukere som har valgt ukentlig digest
    const users = await prisma.user.findMany({
      where: {
        notificationSettings: {
          emailNotifications: true,
          emailDigestFrequency: 'WEEKLY'
        }
      },
      include: {
        notificationSettings: true
      }
    })

    const lastWeek = new Date()
    lastWeek.setDate(lastWeek.getDate() - 7)

    for (const user of users) {
      // Hent uleste varsler for brukeren fra siste uke
      const notifications = await prisma.notification.findMany({
        where: {
          userId: user.id,
          createdAt: {
            gte: lastWeek
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      if (notifications.length === 0) continue

      // Grupper varsler etter type
      const groupedNotifications = groupNotificationsByType(notifications)
      
      // Generer e-postinnhold
      const emailContent = generateDigestEmail(groupedNotifications, 'weekly')

      // Send e-post
      await sendEmail({
        to: user.email!,
        subject: `Ukentlig HMS-oppsummering - Uke ${getWeekNumber()}`,
        html: emailContent
      })

      // Marker varsler som sendt i digest
      await prisma.notification.updateMany({
        where: {
          id: {
            in: notifications.map(n => n.id)
          }
        },
        data: {
          metadata: {
            digestSentAt: new Date()
          }
        }
      })
    }
  } catch (error) {
    console.error('Error sending weekly digest:', error)
    throw error
  }
}

function groupNotificationsByType(notifications: DigestNotification[]) {
  return notifications.reduce((groups, notification) => {
    const type = notification.type
    if (!groups[type]) {
      groups[type] = []
    }
    groups[type].push(notification)
    return groups
  }, {} as Record<string, DigestNotification[]>)
}

function generateDigestEmail(
  groupedNotifications: Record<string, DigestNotification[]>, 
  type: 'daily' | 'weekly' = 'daily'
) {
  const title = type === 'daily' ? 'Daglig HMS-oppsummering' : 'Ukentlig HMS-oppsummering'
  
  let html = `
    <h1 style="color: #333; font-size: 24px; margin-bottom: 20px;">${title}</h1>
    <p style="color: #666; margin-bottom: 30px;">
      Her er en oversikt over dine HMS-varsler ${type === 'daily' ? 'fra siste døgn' : 'fra siste uke'}.
    </p>
  `

  for (const [type, notifications] of Object.entries(groupedNotifications)) {
    html += `
      <div style="margin-bottom: 30px;">
        <h2 style="color: #444; font-size: 18px; margin-bottom: 15px;">
          ${getNotificationTypeTitle(type)} (${notifications.length})
        </h2>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
    `

    notifications.forEach(notification => {
      html += `
        <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #ddd;">
          <h3 style="color: #333; font-size: 16px; margin: 0 0 5px 0;">
            ${notification.title}
          </h3>
          <p style="color: #666; margin: 0 0 5px 0;">
            ${notification.message}
          </p>
          <small style="color: #999;">
            ${formatDate(notification.createdAt)}
          </small>
        </div>
      `
    })

    html += `
        </div>
      </div>
    `
  }

  return html
}

function getNotificationTypeTitle(type: string): string {
  const titles: Record<string, string> = {
    DEVIATION_CREATED: 'Nye avvik',
    DEVIATION_ASSIGNED: 'Tildelte avvik',
    DEVIATION_UPDATED: 'Oppdaterte avvik',
    DEVIATION_CLOSED: 'Lukkede avvik',
    SJA_CREATED: 'Nye SJA',
    SJA_ASSIGNED: 'Tildelte SJA',
    SJA_UPDATED: 'Oppdaterte SJA',
    SJA_APPROVED: 'Godkjente SJA'
  }
  return titles[type] || type
}

function getWeekNumber(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  const diff = now.getTime() - start.getTime()
  const oneWeek = 1000 * 60 * 60 * 24 * 7
  return Math.ceil(diff / oneWeek)
} 