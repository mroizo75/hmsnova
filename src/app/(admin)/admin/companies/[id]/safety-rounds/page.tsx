import { SafetyRoundsAdminClient } from "./safety-rounds-admin-client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { redirect } from "next/navigation"

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function AdminSafetyRoundsPage({ params, searchParams }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !['ADMIN', 'SUPPORT'].includes(session.user.role)) {
    redirect('/login')
  }

  const { id } = await params

  const company = await prisma.company.findFirst({
    where: {
      id: id,
      modules: {
        some: {
          key: 'SAFETY_ROUNDS'
        }
      }
    },
    include: {
      modules: true,
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      }
    }
  })

  if (!company) redirect('/admin/companies')

  const safetyRounds = await prisma.safetyRound.findMany({
    where: {
      module: {
        companyId: id,
        key: 'SAFETY_ROUNDS'
      }
    },
    include: {
      findings: {
        include: {
          measures: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="container mx-auto py-6">
      <SafetyRoundsAdminClient 
        companyId={company.id}
        safetyRounds={safetyRounds}
        users={company.users}
      />
    </div>
  )
} 