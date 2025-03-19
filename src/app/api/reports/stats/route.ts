import { NextResponse } from 'next/server'
import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { Status } from "@prisma/client"
import { format } from "date-fns"

// Definerte typer som tidligere var i reports-client.tsx
interface StatsItem {
  companyId: string
  status: string
  _count: {
    _all: number
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session?.user?.companyId) {
      return NextResponse.json({ error: 'Uautorisert' }, { status: 401 })
    }

    const companyId = session.user.companyId
    const stats = await fetchReportStats(companyId)
    
    // Opprett standard audit-data
    const auditData = {
      handbook: {
        version: 1,
        lastUpdated: new Date().toISOString(),
        changes: []
      },
      deviations: {
        total: await prisma.deviation.count({ 
          where: { companyId } 
        }) || 0,
        bySeverity: [],
        implementedMeasures: 0,
        companyId
      },
      riskAssessments: {
        total: await prisma.riskAssessment.count({ 
          where: { companyId } 
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
    }

    return NextResponse.json({
      stats: stats.finalStats,
      trends: stats.trends,
      auditData
    })
  } catch (error) {
    console.error("Error loading reports:", error)
    return NextResponse.json({ error: 'Kunne ikke laste rapportdata' }, { status: 500 })
  }
}

// Funksjon for å hente rapportstatistikk
async function fetchReportStats(companyId: string) {
  const stats = await prisma.$transaction(async (tx) => {
    console.log('Starting transaction...')
    const deviations = await tx.deviation.groupBy({
      by: ['status'],
      where: { 
        companyId,
        status: {
          in: ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CLOSED', 'AAPEN', 'PAAGAAR', 'LUKKET']
        }
      },
      _count: {
        _all: true
      }
    }).then(results => {
      return results.map(item => ({
        companyId,
        status: item.status,
        _count: item._count
      })) 
    })

    const riskAssessments = await tx.riskAssessment.findMany({
      where: {
        companyId,
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
        companyId,
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
  return stats
} 