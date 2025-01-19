import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { redirect } from "next/navigation"
import { SafetyRoundReports } from "./safety-round-reports"

export default async function SafetyRoundsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const reports = await prisma.safetyRound.findMany({
    where: {
      module: {
        companyId: session.user.companyId,
        key: 'SAFETY_ROUNDS'
      },
      status: 'COMPLETED' // Kun godkjente/fullførte vernerunder vises
    },
    include: {
      findings: {
        include: {
          measures: true
        }
      }
    },
    orderBy: {
      completedAt: 'desc'
    }
  })

  return <SafetyRoundReports reports={reports as any} />
} 