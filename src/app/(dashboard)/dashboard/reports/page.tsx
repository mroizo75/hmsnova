import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { ReportsClient } from "./reports-client"
import { notFound } from "next/navigation"
import { StatsItem } from "./reports-client"
import { InternalAuditData } from "./internal-audit-report"

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return notFound()

    // Hent statistikk
    const stats = await prisma.$transaction(async (tx) => {
      // Deviations statistikk med default verdier
      const deviations = await tx.deviation.groupBy({
        by: ['status', 'companyId'],
        _count: {
          _all: true
        },
        where: {
          companyId: session.user.companyId
        },
        orderBy: [{ status: 'asc' }]
      }) as unknown as StatsItem[] || []

      // RiskAssessments statistikk med default verdier
      const riskAssessments = await tx.riskAssessment.groupBy({
        by: ['status', 'companyId'],
        _count: {
          _all: true
        },
        where: {
          companyId: session.user.companyId
        },
        orderBy: [{ status: 'asc' }]
      }) as unknown as StatsItem[] || []

      // Monthly statistikk med default verdier
      const monthly = await tx.deviation.groupBy({
        by: ['createdAt'],
        _count: {
          _all: true
        },
        where: {
          companyId: session.user.companyId,
          createdAt: {
            gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      }) || []

      return [deviations, riskAssessments, monthly]
    })

    // Hent internrevisjonsdata med default verdier
    const auditData = {
      handbook: {
        version: 1,
        lastUpdated: new Date().toISOString(),
        changes: []
      },
      deviations: {
        total: await prisma.deviation.count({ 
          where: { companyId: session.user.companyId } 
        }) || 0,
        bySeverity: [],
        implementedMeasures: 0
      },
      riskAssessments: {
        total: await prisma.riskAssessment.count({ 
          where: { companyId: session.user.companyId } 
        }) || 0,
        completed: 0,
        highRiskCount: 0,
        implementedMeasures: 0
      },
      safetyRounds: {
        total: 0,
        findings: 0,
        completedMeasures: 0
      },
      activities: {
        training: [],
        inspections: 0
      },
      goals: {
        achieved: 0,
        total: 0,
        nextYearGoals: []
      }
    } satisfies InternalAuditData

    // Sjekk om vi har noen data i det hele tatt
    const hasData = stats[0].length > 0 || stats[1].length > 0 || stats[2].length > 0 || 
                    auditData.deviations.total > 0 || auditData.riskAssessments.total > 0

    if (!hasData) {
      return (
        <div className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Ingen rapportdata tilgjengelig enda</h2>
          <p className="text-gray-600">
            Start med å registrere avvik, risikovurderinger eller andre HMS-aktiviteter 
            for å se statistikk og rapporter her.
          </p>
        </div>
      )
    }

    return <ReportsClient stats={stats as [StatsItem[], StatsItem[], any[]]} auditData={auditData} />

  } catch (error) {
    console.error('Error in ReportsPage:', error)
    return (
      <div className="p-4">
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Kunne ikke laste rapportdata</h2>
          <p>Vennligst prøv igjen senere eller kontakt support hvis problemet vedvarer.</p>
        </div>
      </div>
    )
  }
} 