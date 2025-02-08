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

    console.log('Session:', { userId: session.user.id, companyId: session.user.companyId })

    const stats = await prisma.$transaction(async (tx) => {
      console.log('Starting transaction...')

      // Deviations statistikk
      console.log('Fetching deviations...')
      const deviations = await tx.deviation.groupBy({
        by: ['status', 'companyId'],
        _count: {
          _all: true
        },
        where: {
          companyId: session.user.companyId,
          status: {
            in: ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CLOSED']
          }
        },
        orderBy: [{ status: 'asc' }]
      }).then(results => {
        console.log('Deviations results:', results)
        return results || []
      }) as StatsItem[]

      // RiskAssessments statistikk og trender
      console.log('Fetching risk assessments...')
      const riskAssessments = await tx.riskAssessment.findMany({
        where: {
          companyId: session.user.companyId,
          status: {
            in: ['DRAFT', 'OPEN', 'IN_PROGRESS', 'SCHEDULED', 'CLOSED', 'COMPLETED', 'CANCELLED']
          }
        },
        include: {
          hazards: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      }).then(async (results) => {
        // Gruppér etter status for stats
        const statsByStatus = results.reduce((acc, curr) => {
          if (!acc[curr.status]) {
            acc[curr.status] = {
              status: curr.status,
              companyId: curr.companyId,
              _count: { _all: 0 }
            }
          }
          acc[curr.status]._count._all++
          return acc
        }, {} as Record<string, StatsItem>)

        // Beregn trender
        const monthlyRisks = results.reduce((acc, assessment) => {
          const month = new Date(assessment.createdAt).toISOString().slice(0, 7)
          
          if (!acc[month]) {
            acc[month] = {
              date: month,
              maxRiskLevel: 0,
              assessmentCount: 0,
              highRiskCount: 0
            }
          }

          assessment.hazards.forEach(hazard => {
            const riskLevel = hazard.riskLevel
            acc[month].maxRiskLevel = Math.max(acc[month].maxRiskLevel, riskLevel)
            if (riskLevel > 15) {
              acc[month].highRiskCount++
            }
          })
          
          acc[month].assessmentCount++
          return acc
        }, {} as Record<string, any>)

        return {
          stats: Object.values(statsByStatus),
          trends: Object.values(monthlyRisks)
        }
      }) as { 
        stats: StatsItem[], 
        trends: { 
          date: string
          maxRiskLevel: number
          assessmentCount: number
          highRiskCount: number 
        }[] 
      }

      // Monthly statistikk
      console.log('Fetching monthly stats...')
      const monthly = await tx.deviation.groupBy({
        by: ['createdAt'],
        _count: {
          _all: true
        },
        where: {
          companyId: session.user.companyId,
          status: {
            in: ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CLOSED']  // Samme som deviations
          },
          createdAt: {
            gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      }).then(results => {
        console.log('Monthly results:', results)
        return results || []
      })

      const finalStats = [deviations, riskAssessments.stats, monthly] as [StatsItem[], StatsItem[], any[]]
      console.log('Final stats structure:', {
        deviationsLength: deviations.length,
        riskAssessmentsLength: riskAssessments.stats.length,
        monthlyLength: monthly.length,
        deviationsType: typeof deviations,
        riskAssessmentsType: typeof riskAssessments.stats,
        monthlyType: typeof monthly
      })

      return {
        finalStats: finalStats,
        trends: riskAssessments.trends
      }
    })

    console.log('Transaction completed')

    // Hent internrevisjonsdata med default verdier
    console.log('Fetching audit data...')
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
        implementedMeasures: 0,
        companyId: session.user.companyId
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

    console.log('Rendering ReportsClient...')
    return <ReportsClient stats={stats.finalStats} auditData={auditData} trends={stats.trends} />

  } catch (error) {
    console.error('Detailed error in ReportsPage:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    
    return (
      <div className="p-4">
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Kunne ikke laste rapportdata</h2>
          <p>Vennligst prøv igjen senere eller kontakt support hvis problemet vedvarer.</p>
          {process.env.NODE_ENV === 'development' && (
            <pre className="mt-2 text-xs">
              {JSON.stringify(error, null, 2)}
            </pre>
          )}
        </div>
      </div>
    )
  }
} 