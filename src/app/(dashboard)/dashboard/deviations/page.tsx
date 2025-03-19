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

  // Optimalisert spørring med alle nødvendige relasjoner i én spørring
  const deviations = await prisma.deviation.findMany({
    where: {
      companyId: session.user.companyId,
      status: {
        in: Object.values(Status)
      }
    },
    include: {
      // For measures, hent kun det vi trenger (status)
      measures: {
        select: {
          id: true,
          status: true
        }
      },
      // For company, filtrer ned til kun brukere
      company: {
        select: {
          id: true,
          name: true,
          users: {
            where: {
              // Her filtrerer vi brukerlisten til kun å inneholde rapportøren
              // Dette reduserer datamengden som hentes betydelig
              id: {
                in: [session.user.id] // Inkluder kun nødvendige brukere
              }
            },
            select: {
              id: true,
              name: true
            }
          }
        }
      },
      // Inkluder kun det første bildet for listevisning
      images: {
        take: 1,
        select: {
          id: true,
          url: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Transformerer data med optimalisert tilnærming - ingen flere databasekall
  const transformedDeviations = deviations.map(deviation => {
    const reporter = deviation.company.users.find(u => u.id === deviation.reportedBy);
    
    return {
      ...deviation,
      priority: deviation.severity || 'MEDIUM',
      createdBy: reporter?.name || 'Ukjent bruker',
      completedMeasures: deviation.measures.filter(m => m.status === 'CLOSED').length,
      totalMeasures: deviation.measures.length,
      // Beholder bare første bilde eller tom liste
      images: deviation.images || [],
      // Nullstill company for å redusere datamengden som sendes til frontend
      company: undefined
    };
  });

  return (
    <div className="container py-6">
      <DeviationsClient deviations={transformedDeviations as unknown as Deviation[]} />
    </div>
  )
}

export const metadata = {
  title: 'Avviksbehandling',
  description: 'Registrering og oppfølging av avvik'
} 