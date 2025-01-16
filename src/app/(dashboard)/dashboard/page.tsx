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
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  CLOSED: 'CLOSED'
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
        take: 5,
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          assignedTo: true,
          severity: true
        }
      },
      riskAssessments: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          createdAt: true
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
    _count: true
  })

  // Initialiser med 0 for alle statuser
  const defaultCounts = {
    [DeviationStatus.OPEN]: 0,
    [DeviationStatus.IN_PROGRESS]: 0,
    [DeviationStatus.CLOSED]: 0
  }

  // Legg til faktiske tall
  const statusCounts = deviations.reduce((acc, curr) => {
    acc[curr.status as keyof typeof DeviationStatus] = curr._count
    return acc
  }, defaultCounts)

  return statusCounts
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const stats = await getCompanyStats(session.user.id)
  const deviationStats = await getDeviationStats(stats.id)

  // Beregn gjennomsnittlig behandlingstid (dummy data for nå)
  const avgProcessingTime = "3.2"
  const activeMeasures = stats.deviations.reduce((acc, dev) => acc + (dev.measures?.length || 0), 0)
  const docsUpdated = "95"

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
                <span className="font-medium">
                  {deviationStats.CLOSED}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Gjennomsnittlig behandlingstid</span>
                <span className="font-medium">{avgProcessingTime} dager</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Aktive tiltak</span>
                <span className="font-medium">{activeMeasures}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">HMS-dokumenter oppdatert</span>
                <span className="font-medium">{docsUpdated}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 