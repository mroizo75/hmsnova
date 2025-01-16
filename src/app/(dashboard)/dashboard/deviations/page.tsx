import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { DeviationList } from "./deviation-list"

export default async function DeviationsPage() {
  const session = await getServerSession(authOptions)
  
  const deviations = await prisma.deviation.findMany({
    where: {
      companyId: session?.user.companyId
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
    createdBy: deviation.company.users.find(u => u.id === deviation.reportedBy)?.name || 'Ukjent bruker',
    completedMeasures: deviation.measures.filter(m => m.status === 'CLOSED').length,
    totalMeasures: deviation.measures.length,
    company: undefined // Remove company data before sending to client
  }))

  return <DeviationList deviations={transformedDeviations} />
}

export const metadata = {
  title: 'Avviksbehandling',
  description: 'Registrering og oppfølging av avvik'
} 