import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { NotificationsClient } from "@/app/(dashboard)/dashboard/notifications/notifications-client"

export const metadata = {
  title: 'Varsler | Innutio',
  description: 'Administrer dine varsler',
}

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const notifications = await prisma.notification.findMany({
    where: {
      userId: session.user.id
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return <NotificationsClient initialData={notifications} />
} 