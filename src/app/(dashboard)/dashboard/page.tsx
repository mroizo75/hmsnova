import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { DashboardUpdates } from "@/components/dashboard/dashboard-updates"
import { StatsCards } from "@/components/dashboard/stats/stats-cards"
import { DeviationStats } from "@/components/dashboard/stats/deviation-stats"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { nb } from "date-fns/locale"
import { AlertTriangle, FileCheck2, Clock, User, TrendingUp, TrendingDown, ArrowRight, BarChart2 } from "lucide-react"
import { SJAStatus, Status } from "@prisma/client"
import { cn } from "@/lib/utils"
import { LineChart, Line, ResponsiveContainer } from "recharts"

// Definer status enum
const DeviationStatus = {
  OPEN: 'AAPEN',
  IN_PROGRESS: 'PAAGAAR',
  CLOSED: 'LUKKET'
} as const

async function getCompanyStats(userId: string) {
  const company = await prisma.company.findFirst({
    where: {
      users: { some: { id: userId } }
    },
    select: {
      id: true,
      _count: {
        select: {
          users: true,
          deviations: true,
          riskAssessments: true,
          documents: true
        }
      },
      deviations: {
        where: {
          status: {
            not: 'LUKKET'  // Hent alle som ikke er lukket for StatsCards
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          assignedTo: true,
          severity: true,
          description: true
        }
      },
      riskAssessments: {
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: {
          id: true,
          title: true,
          createdAt: true,
          status: true
        }
      }
    }
  })

  if (!company) {
    throw new Error('Company not found')
  }

  return company
}

async function getDeviationStats(companyId: string) {
  // Først, la oss telle hver status separat for å unngå groupBy
  const aapenCount = await prisma.deviation.count({
    where: { 
      companyId,
      status: 'AAPEN'
    }
  })

  const paagaarCount = await prisma.deviation.count({
    where: { 
      companyId,
      status: 'PAAGAAR'
    }
  })

  const lukketCount = await prisma.deviation.count({
    where: { 
      companyId,
      status: 'LUKKET'
    }
  })

  // Returner direkte med de mappede verdiene
  return {
    OPEN: aapenCount,
    IN_PROGRESS: paagaarCount,
    CLOSED: lukketCount
  }
}

async function getHMSStats(companyId: string) {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // Hent lukket avvik siste 30 dager
  const closedDeviations = await prisma.deviation.count({
    where: {
      companyId,
      status: 'LUKKET',
      updatedAt: {
        gte: thirtyDaysAgo
      }
    }
  })

  // Beregn gjennomsnittlig behandlingstid for lukkede avvik
  const completedDeviations = await prisma.deviation.findMany({
    where: {
      companyId,
      status: 'LUKKET',
    },
    select: {
      createdAt: true,
      updatedAt: true
    }
  })

  const avgProcessingTime = completedDeviations.length > 0
    ? completedDeviations.reduce((acc, dev) => {
        const days = Math.floor((dev.updatedAt.getTime() - dev.createdAt.getTime()) / (1000 * 60 * 60 * 24))
        return acc + days
      }, 0) / completedDeviations.length
    : 0

  // Hent aktive tiltak
  const activeMeasures = await prisma.measure.count({
    where: {
      hazard: {
        riskAssessment: {
          companyId
        }
      },
      status: 'OPEN'
    }
  })

  // Beregn prosent av oppdaterte dokumenter
  const allDocs = await prisma.document.count({
    where: { companyId }
  })

  const updatedDocs = await prisma.document.count({
    where: {
      companyId,
      updatedAt: {
        gte: thirtyDaysAgo
      }
    }
  })

  const docsUpdatedPercent = allDocs > 0
    ? Math.round((updatedDocs / allDocs) * 100)
    : 0

  return {
    closedDeviations,
    avgProcessingTime: avgProcessingTime.toFixed(1),
    activeMeasures,
    docsUpdatedPercent
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  // Hent bedriftens ID fra brukerens sesjon
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { companyId: true }
  })

  if (!user?.companyId) return null

  // Hent statistikk for bedriften
  const stats = await prisma.company.findUnique({
    where: { id: user.companyId },
    select: {
      users: true,
      deviations: {
        where: {
          status: {
            notIn: [Status.CLOSED, Status.LUKKET]  // Ekskluder begge "lukket" statuser
          }
        },
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          assignedTo: true,
          severity: true,
          description: true
        }
      },
      riskAssessments: true,
      SJA: true
    }
  })

  // Konverter stats til riktig format hvis det finnes
  const formattedStats = stats ? {
    users: stats.users,
    deviations: stats.deviations,
    riskAssessments: stats.riskAssessments,
    SJA: stats.SJA
  } : null

  // Hent avviksstatistikk
  const deviationStats = await prisma.deviation.groupBy({
    by: ['status'],
    where: { 
      companyId: user.companyId,
      status: {
        in: [
          Status.OPEN, Status.AAPEN,
          Status.IN_PROGRESS, Status.PAAGAAR,
          Status.CLOSED, Status.LUKKET
        ]
      }
    },
    _count: true
  })

  // Konverter til formatet som komponenten forventer
  const formattedDeviationStats = deviationStats.map(stat => ({
    status: stat.status,
    _count: stat._count
  }))

  // Hent tiltak-statistikk
  const measureStats = await prisma.measure.findMany({
    where: { 
      hazard: {
        riskAssessment: {
          companyId: user.companyId
        }
      },
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    },
    select: {
      status: true,
      priority: true,
      createdAt: true,
      completedAt: true
    },
    orderBy: { createdAt: 'desc' }
  })

  // Hent de siste avvikene og SJA'ene
  const [recentDeviations, recentSJAs] = await Promise.all([
    prisma.deviation.findMany({
      where: { 
        companyId: user.companyId,
        status: {
          in: [
            Status.OPEN, Status.AAPEN,
            Status.IN_PROGRESS, Status.PAAGAAR
          ]
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        assignedTo: true,
        severity: true,
        description: true
      }
    }),
    prisma.sJA.findMany({
      where: {
        companyId: user.companyId
      },
      include: {
        risikoer: {
          select: {
            risikoVerdi: true,
            sannsynlighet: true,
            alvorlighet: true
          }
        },
        opprettetAv: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { opprettetDato: 'desc' },
      take: 3
    })
  ])

  // Hent både RiskAssessment og SJA risikoer
  const [riskAssessments, sjaRisks] = await Promise.all([
    prisma.hazard.findMany({
      where: {
        riskAssessment: {
          companyId: user.companyId
        }
      },
      select: {
        riskLevel: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.sJA.findMany({
      where: {
        companyId: user.companyId
      },
      include: {  // Bruk include istedenfor select for relasjoner
        risikoer: {  // liten r
          select: {
            risikoVerdi: true,
            sannsynlighet: true,
            alvorlighet: true
          }
        }
      },
      orderBy: { opprettetDato: 'desc' }
    })
  ])

  // Kombiner og sorter alle risikoer etter dato
  const allRisks = [
    ...riskAssessments.map(r => ({ 
      score: r.riskLevel,
      date: r.createdAt 
    })),
    ...sjaRisks.flatMap(sja => 
      sja.risikoer.map(r => ({  // liten r
        score: r.risikoVerdi,
        date: sja.opprettetDato
      }))
    )
  ].sort((a, b) => b.date.getTime() - a.date.getTime())

  // Beregn trend
  const currentAvg = allRisks.slice(0, 5).reduce((acc, r) => acc + r.score, 0) / 5
  const previousAvg = allRisks.slice(5, 10).reduce((acc, r) => acc + r.score, 0) / 5
  const trend = currentAvg - previousAvg

  return (
    <div className="space-y-8">
      <DashboardUpdates />
      <StatsCards stats={formattedStats} />
      
      {/* Avviksstatus */}
      <DeviationStats stats={formattedDeviationStats} />

      {/* Siste aktiviteter */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Siste avvik</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentDeviations.map(deviation => (
                <Link 
                  key={deviation.id}
                  href={`/dashboard/deviations/${deviation.id}`}
                  className="block hover:bg-muted/50 p-2 rounded-lg transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          deviation.severity === 'HIGH' ? 'destructive' : 
                          deviation.severity === 'MEDIUM' ? 'warning' : 
                          'secondary'
                        }>
                          {deviation.severity}
                        </Badge>
                        <p className="font-medium">{deviation.title}</p>
                      </div>
                      <Badge variant={
                        deviation.status === Status.OPEN ? 'destructive' : 
                        deviation.status === Status.IN_PROGRESS ? 'secondary' : 
                        'outline'
                      }>
                        {deviation.status === Status.OPEN ? 'Åpen' : 
                         deviation.status === Status.IN_PROGRESS ? 'Under arbeid' : 
                         'Lukket'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDistanceToNow(deviation.createdAt, { addSuffix: true, locale: nb })}
                      </div>
                      {deviation.assignedTo && (
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          Tildelt
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Siste SJA</CardTitle>
            <FileCheck2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSJAs.map(sja => (
                <Link 
                  key={sja.id}
                  href={`/dashboard/sja/${sja.id}`}
                  className="block hover:bg-muted/50 p-2 rounded-lg transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{sja.tittel}</p>
                      <Badge variant={
                        sja.status === SJAStatus.GODKJENT ? 'default' : 
                        sja.status === SJAStatus.UTKAST ? 'secondary' : 
                        'outline'
                      }>
                        {sja.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDistanceToNow(sja.opprettetDato, { addSuffix: true, locale: nb })}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {sja.opprettetAv.name || sja.opprettetAv.email}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tiltak-trend*/}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Risiko-trend</CardTitle>
          <BarChart2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Høyeste risikofaktor</p>
                <h2 className="text-2xl font-bold">
                  {Math.max(...allRisks.map(r => r.score))}
                </h2>
              </div>
              <div className={cn(
                "flex items-center rounded-full px-2 py-1",
                trend > 0 ? "bg-red-100 text-red-700" : 
                trend < 0 ? "bg-green-100 text-green-700" : 
                "bg-yellow-100 text-yellow-700"
              )}>
                {trend > 0 ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : trend < 0 ? (
                  <TrendingDown className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowRight className="h-4 w-4 mr-1" />
                )}
                <span className="text-sm font-medium">
                  {Math.abs(trend).toFixed(1)} poeng {trend > 0 ? 'økning' : trend < 0 ? 'reduksjon' : 'uendret'}
                </span>
              </div>
            </div>

            {/* Mini-graf som viser trend */}
            <div className="h-16 relative">
              <div 
                className="absolute inset-0 flex items-end"
                style={{
                  background: `linear-gradient(to right, ${
                    trend > 0 ? '#ef4444' : 
                    trend < 0 ? '#22c55e' : 
                    '#eab308'
                  }22, transparent)`
                }}
              >
                {allRisks.slice(0, 10).map((risk, i) => (
                  <div
                    key={i}
                    className="flex-1"
                    style={{
                      height: `${(risk.score / Math.max(...allRisks.map(r => r.score))) * 100}%`,
                      background: trend > 0 ? '#ef4444' : trend < 0 ? '#22c55e' : '#eab308',
                      opacity: 0.5 + (i / 20)
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground">Høy risiko</p>
                <p className="font-medium">
                  {allRisks.filter(r => r.score > 12).length}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Middels</p>
                <p className="font-medium">
                  {allRisks.filter(r => r.score >= 6 && r.score <= 12).length}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Lav</p>
                <p className="font-medium">
                  {allRisks.filter(r => r.score < 6).length}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 