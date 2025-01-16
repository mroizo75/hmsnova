import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { notFound } from "next/navigation"
import { SafetyRoundReportList } from "./safety-round-report-list"

export default async function SafetyRoundReportsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return notFound()

  const reports = await prisma.safetyRoundReport.findMany({
    where: {
      safetyRound: {
        companyId: session.user.companyId
      }
    },
    include: {
      safetyRound: {
        include: {
          creator: {
            select: {
              name: true
            }
          },
          assignedUser: {
            select: {
              name: true
            }
          }
        }
      }
    },
    orderBy: {
      generatedAt: 'desc'
    }
  })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Vernerunderapporter</h1>
      <SafetyRoundReportList reports={reports} />
    </div>
  )
} 