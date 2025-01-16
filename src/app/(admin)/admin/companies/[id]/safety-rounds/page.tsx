import { Suspense } from "react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { redirect } from "next/navigation"
import { SafetyRoundsAdminClient } from "./safety-rounds-admin-client"

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: { [key: string]: string | string[] | undefined }
}

async function SafetyRoundsContent({ companyId }: { companyId: string }) {
  const company = await prisma.company.findFirst({
    where: {
      id: companyId,
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
        companyId,
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
    <SafetyRoundsAdminClient 
      company={company} 
      safetyRounds={safetyRounds}
      users={company.users}
    />
  )
}

export default async function AdminSafetyRoundsPage(props: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !['ADMIN', 'SUPPORT'].includes(session.user.role)) {
    redirect('/login')
  }

  const { id } = await props.params

  return (
    <div className="container mx-auto py-6">
      <SafetyRoundsAdminClient companyId={id} />
    </div>
  )
} 