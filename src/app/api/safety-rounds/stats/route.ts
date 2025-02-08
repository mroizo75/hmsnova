import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Hent vernerunder fra siste 12 måneder
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

    const stats = await prisma.safetyRound.findMany({
      where: {
        companyId: session.user.companyId,
        createdAt: {
          gte: twelveMonthsAgo
        }
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
                status: true,
                completedAt: true,
                createdAt: true
              }
            },
            images: {
              select: {
                id: true,
                url: true
              }
            },
            deviation: {
              select: {
                id: true,
                status: true,
                createdAt: true,
                closedAt: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Debug logging
    console.log('Stats overview:', {
      totalRounds: stats.length,
      findings: stats.map(round => ({
        roundId: round.id,
        findingsCount: round.findings.length,
        findings: round.findings.map(f => ({
          id: f.id,
          status: f.status,
          deviation: f.deviation ? {
            id: f.deviation.id,
            status: f.deviation.status,
            createdAt: f.deviation.createdAt,
            closedAt: f.deviation.closedAt
          } : null,
          createdAt: f.createdAt
        }))
      }))
    })

    // Debug for lukkede funn
    const closedFindings = stats.flatMap(round => 
      round.findings.filter(f => f.deviation?.status === 'CLOSED'))
    
    console.log('Closed findings:', {
      total: closedFindings.length,
      details: closedFindings.map(f => ({
        id: f.id,
        deviationId: f.deviation?.id,
        createdAt: f.createdAt,
        closedAt: f.deviation?.closedAt,
        daysToClose: f.deviation?.closedAt ? 
          Math.floor((new Date(f.deviation.closedAt).getTime() - new Date(f.createdAt).getTime()) 
          / (1000 * 60 * 60 * 24)) : null
      }))
    })

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching safety round stats:', error)
    return new NextResponse("Error fetching stats", { status: 500 })
  }
} 