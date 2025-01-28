import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { DeviationsClient } from "./deviations-client"
import { Deviation } from "@/lib/types/deviation"
import { notFound } from "next/navigation"

export default async function DeviationsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return notFound()

  const deviations = await prisma.deviation.findMany({
    where: {
      companyId: session.user.companyId
    },
    include: {
      measures: true,
      company: {
        include: {
          users: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Transform data to include user names and measure counts
  const transformedDeviations = deviations.map(deviation => ({
    ...deviation,
    priority: deviation.severity || 'MEDIUM',
    createdBy: deviation.company.users.find(u => u.id === deviation.reportedBy)?.name || 'Ukjent bruker',
    completedMeasures: deviation.measures.filter(m => m.status === 'CLOSED').length,
    totalMeasures: deviation.measures.length,
    images: [],
    company: undefined
  })) satisfies Deviation[]

  return (
    <div className="container py-6">
      <DeviationsClient deviations={transformedDeviations} />
    </div>
  )
}

export const metadata = {
  title: 'Avviksbehandling',
  description: 'Registrering og oppfølging av avvik'
} 