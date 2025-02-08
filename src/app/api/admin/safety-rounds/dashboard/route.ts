import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { startOfMonth, subMonths } from "date-fns"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'SUPPORT'].includes(session.user.role)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const now = new Date()
    const startOfCurrentMonth = startOfMonth(now)
    const startOfPreviousMonth = startOfMonth(subMonths(now, 1))

    const [
      totalCount,
      activeCount,
      monthlyFindings,
      completionRate,
      statusDistribution,
      recentRounds,
      companyStats
    ] = await Promise.all([
      // Totalt antall vernerunder
      prisma.safetyRound.count(),
      
      // Aktive vernerunder
      prisma.safetyRound.count({
        where: {
          status: {
            in: ['SCHEDULED', 'IN_PROGRESS']
          }
        }
      }),

      // Funn denne måneden
      prisma.safetyRoundFinding.count({
        where: {
          createdAt: {
            gte: startOfCurrentMonth
          }
        }
      }),

      // Gjennomføringsgrad
      prisma.safetyRound.findMany({
        where: {
          dueDate: {
            lt: now
          }
        },
        select: {
          status: true
        }
      }),

      // Status fordeling
      prisma.safetyRound.groupBy({
        by: ['status'],
        _count: true
      }),

      // Siste vernerunder
      prisma.safetyRound.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          company: {
            select: {
              name: true
            }
          }
        }
      }),

      // Bedriftsstatistikk - oppdatert med riktig feltnavn
      prisma.company.findMany({
        include: {
          SafetyRound: {
            select: {
              id: true,
              status: true,
              completedAt: true
            }
          }
        }
      })
    ])

    // Transformer data for å få riktig format for frontend
    const transformedCompanyStats = companyStats.map(company => ({
      company: company.name,
      completed: company.SafetyRound.filter(r => r.status === 'COMPLETED').length,
      active: company.SafetyRound.filter(r => ['SCHEDULED', 'IN_PROGRESS'].includes(r.status)).length
    }))

    return NextResponse.json({
      totalCount,
      activeCount,
      monthlyFindings,
      completionRate,
      statusDistribution,
      recentRounds,
      companyStats: transformedCompanyStats
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 