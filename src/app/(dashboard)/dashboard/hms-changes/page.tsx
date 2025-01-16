import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { HMSChangeList } from "@/components/hms-changes/hms-change-list"

export default async function HMSChangesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const changes = await prisma.hMSChange.findMany({
    where: {
      companyId: session.user.companyId
    },
    include: {
      deviations: {
        include: {
          deviation: {
            select: {
              id: true,
              title: true
            }
          }
        }
      },
      riskAssessments: {
        include: {
          riskAssessment: {
            select: {
              id: true,
              title: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Transformer data for frontend
  const transformedChanges = changes.map(change => ({
    ...change,
    source: change.deviations[0] 
      ? { 
          type: "DEVIATION" as const,
          id: change.deviations[0].deviation.id,
          title: change.deviations[0].deviation.title
        }
      : {
          type: "RISK_ASSESSMENT" as const,
          id: change.riskAssessments[0].riskAssessment.id,
          title: change.riskAssessments[0].riskAssessment.title
        }
  }))

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">HMS-endringer</h1>
      <HMSChangeList changes={transformedChanges} />
    </div>
  )
} 