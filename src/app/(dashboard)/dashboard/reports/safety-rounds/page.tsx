import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { redirect } from "next/navigation"
import { SafetyRoundReports } from "./safety-round-reports"
import { SafetyRoundStats } from "./safety-round-stats"
import { SafetyRoundTrends } from "./safety-round-trends"
import { SafetyRoundReport } from "@/types/safety-rounds"

export default async function SafetyRoundReportsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const reports = await prisma.safetyRound.findMany({
    where: {
      module: {
        companyId: session.user.companyId,
        key: 'SAFETY_ROUNDS'
      },
      status: 'COMPLETED'
    },
    select: {
      id: true,
      title: true,
      description: true,
      completedAt: true,
      findings: {
        select: {
          id: true,
          description: true,
          severity: true,
          status: true,
          createdAt: true,
          measures: {
            select: {
              id: true,
              description: true,
              completedAt: true,
              createdAt: true,
              status: true
            }
          },
          images: {
            select: {
              id: true,
              url: true
            }
          }
        }
      }
    },
    orderBy: {
      completedAt: 'desc'
    }
  })

  return (
    <div className="space-y-8">
      <SafetyRoundStats stats={reports} />
      <SafetyRoundTrends data={reports} />
      <SafetyRoundReports reports={reports} />
    </div>
  )
} 