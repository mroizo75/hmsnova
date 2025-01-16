import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { redirect } from "next/navigation"
import { UsersClient } from "./users-client"

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  const users = await prisma.user.findMany({
    where: {
      role: {
        in: ['ADMIN', 'SUPPORT']
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return <UsersClient users={users} />
}

export const metadata = {
  title: 'Administrer brukere',
  description: 'Administrer system-brukere'
} 