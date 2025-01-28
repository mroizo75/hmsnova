import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { 
  Users, 
  AlertTriangle, 
  FileCheck2, 
  ClipboardCheck, 
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp
} from "lucide-react"
import { formatDate } from "@/lib/utils/date"
import Link from "next/link"
import { DashboardUpdates } from "@/components/dashboard/dashboard-updates"

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
          OR: [
            { status: 'AAPEN' },
            { status: 'PAAGAAR' }
          ]
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
          measures: true
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
  const deviations = await prisma.deviation.groupBy({
    by: ['status'],
    where: { companyId },
    _count: true,
    orderBy: {
      _count: {
        status: 'desc'
      }
    }
  })

  // Initialiser med 0 for alle statuser
  const defaultCounts = {
    AAPEN: 0,
    PAAGAAR: 0,
    LUKKET: 0
  }

  // Legg til faktiske tall
  const statusCounts = deviations.reduce((acc, curr) => {
    acc[curr.status as keyof typeof acc] = curr._count
    return acc
  }, defaultCounts)

  // Returner med riktige nøkler for visning
  return {
    OPEN: statusCounts.AAPEN,
    IN_PROGRESS: statusCounts.PAAGAAR,
    CLOSED: statusCounts.LUKKET
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

  const stats = await getCompanyStats(session.user.id)
  const deviationStats = await getDeviationStats(stats.id)
  const hmsStats = await getHMSStats(stats.id)

  return (
    <div className="space-y-8">
      <DashboardUpdates />
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Sist oppdatert: {formatDate(new Date())}
        </p>
      </div>
      
      {/* Hovedstatistikk */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ansatte</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?._count.users ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Aktive brukere i systemet
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Åpne avvik</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deviationStats?.OPEN ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Avvik som krever oppfølging
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risikovurderinger</CardTitle>
            <FileCheck2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?._count.riskAssessments ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Totalt antall risikovurderinger
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dokumenter</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?._count.documents ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Aktive dokumenter i systemet
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Avviksstatistikk */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Avviksstatus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-4">
                <AlertCircle className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-sm font-medium">Åpne</p>
                  <p className="text-2xl font-bold">{deviationStats?.OPEN ?? 0}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium">Under arbeid</p>
                  <p className="text-2xl font-bold">{deviationStats?.IN_PROGRESS ?? 0}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Lukket</p>
                  <p className="text-2xl font-bold">{deviationStats?.CLOSED ?? 0}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <TrendingUp className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Totalt</p>
                  <p className="text-2xl font-bold">{stats?._count.deviations ?? 0}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Siste avvik */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Siste avvik</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.deviations.length === 0 ? (
                <p className="text-muted-foreground text-center">Ingen aktive avvik</p>
              ) : (
                stats?.deviations.map(deviation => (
                  <Link 
                    href={`/dashboard/deviations/${deviation.id}`}
                    key={deviation.id}
                    className="block hover:bg-muted/50 p-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{deviation.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(deviation.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {deviation.assignedTo && (
                          <span className="text-sm text-muted-foreground">
                            {deviation.assignedTo}
                          </span>
                        )}
                        <div className={`w-2 h-2 rounded-full ${
                          deviation.status === 'AAPEN' 
                            ? 'bg-red-500' 
                            : 'bg-yellow-500'
                        }`} />
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Siste aktiviteter */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Siste risikovurderinger</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.riskAssessments.map(assessment => (
                <div key={assessment.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{assessment.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(assessment.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>HMS-status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Avvik lukket siste 30 dager</span>
                <span className="font-medium">{hmsStats.closedDeviations}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Gjennomsnittlig behandlingstid</span>
                <span className="font-medium">{hmsStats.avgProcessingTime} dager</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Aktive tiltak</span>
                <span className="font-medium">{hmsStats.activeMeasures}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">HMS-dokumenter oppdatert</span>
                <span className="font-medium">{hmsStats.docsUpdatedPercent}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 