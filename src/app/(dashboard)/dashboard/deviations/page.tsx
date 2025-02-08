import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { DeviationsClient } from "./deviations-client"
import { Deviation } from "@/lib/types/deviation"
import { notFound } from "next/navigation"
import { Status } from "@prisma/client"

export default async function DeviationsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return notFound()

  const deviations = await prisma.deviation.findMany({
    where: {
      companyId: session.user.companyId,
      status: {
        in: Object.values(Status)
      }
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

  // Legg til logging for debugging
  console.log('User companyId:', session.user.companyId)
  console.log('Found deviations count:', deviations.length)
  console.log('Deviations company IDs:', deviations.map(d => d.companyId))

  // Transform data to include user names and measure counts
  const transformedDeviations = deviations.map(deviation => ({
    ...deviation,
    priority: deviation.severity || 'MEDIUM',
    createdBy: deviation.company.users.find(u => u.id === deviation.reportedBy)?.name || 'Ukjent bruker',
    completedMeasures: deviation.measures.filter(m => m.status === 'CLOSED').length,
    totalMeasures: deviation.measures.length,
    images: [],
    company: undefined
  }))

  console.log('Transformed deviations:', transformedDeviations.map(d => ({ id: d.id, status: d.status })))

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