import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { Separator } from "@/components/ui/separator"
import { Award, AlertTriangle, CheckCircle, Clock, FileCheck, User, Download } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"

export default async function DashboardCompetencePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect('/login')
  }

  // Sjekk om kompetansemodulen er aktivert for bedriften
  const competenceModule = await prisma.module.findFirst({
    where: {
      companyId: session.user.companyId,
      key: "COMPETENCE",
      isActive: true
    }
  })

  if (!competenceModule) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] p-6">
        <Award className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Kompetansemodulen er ikke aktivert</h2>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          Kontakt din administrator for å aktivere kompetansemodulen for din bedrift.
        </p>
        <Button asChild variant="outline">
          <Link href="/dashboard">
            Tilbake til dashboard
          </Link>
        </Button>
      </div>
    )
  }

  // Hent statistikk og data for dashboard
  const stats = await getCompetenceStats(session.user.companyId)
  const expiringCompetencies = await getExpiringCompetencies(session.user.companyId)
  const recentCompetencies = await getRecentCompetencies(session.user.companyId)

  return (
    <div className="space-y-6 p-6 pb-16">
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <Award className="h-6 w-6 text-muted-foreground" />
          <h2 className="text-2xl font-bold tracking-tight">Kompetanseoversikt</h2>
        </div>
        <p className="text-muted-foreground">
          Oversikt over kompetanse og sertifiseringer i bedriften
        </p>
      </div>
      <Separator />
      
      {/* Statistikkoversikt */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Totalt"
          value={stats.total}
          description="Registrerte kompetansebevis"
          icon={<Award className="h-4 w-4" />}
        />
        <StatsCard
          title="Utløper snart"
          value={stats.expiringSoon}
          description="Utløper innen 3 måneder"
          icon={<AlertTriangle className="h-4 w-4" />}
          isWarning={stats.expiringSoon > 0}
        />
        <StatsCard
          title="Verifiserte"
          value={stats.verified}
          description="Godkjente kompetansebevis"
          icon={<CheckCircle className="h-4 w-4" />}
        />
        <StatsCard
          title="Venter godkjenning"
          value={stats.pending}
          description="Kompetansebevis til verifisering"
          icon={<Clock className="h-4 w-4" />}
          isWarning={stats.pending > 0}
        />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Utløpende kompetanser */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
              Utløpende kompetansebevis
            </CardTitle>
            <CardDescription>
              Kompetansebevis som utløper innen 3 måneder
            </CardDescription>
          </CardHeader>
          <CardContent>
            {expiringCompetencies.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-muted-foreground">Ingen kompetansebevis utløper i nærmeste fremtid</p>
              </div>
            ) : (
              <div className="space-y-4">
                {expiringCompetencies.map((comp) => (
                  <div key={comp.id} className="flex justify-between items-center border-b pb-3">
                    <div>
                      <p className="font-medium">{comp.competenceType.name}</p>
                      <p className="text-sm text-muted-foreground">{comp.user.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-orange-600 font-medium">{formatDate(comp.expiryDate)}</p>
                      <p className="text-xs text-muted-foreground">
                        {getDaysUntil(comp.expiryDate)} dager igjen
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          {expiringCompetencies.length > 0 && (
            <CardFooter>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/dashboard/competence/expiring">
                  Se alle utløpende
                </Link>
              </Button>
            </CardFooter>
          )}
        </Card>
        
        {/* Nylig registrerte kompetanser */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <FileCheck className="h-5 w-5 mr-2 text-blue-500" />
              Nylig registrerte
            </CardTitle>
            <CardDescription>
              Kompetansebevis registrert siste 30 dager
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentCompetencies.length === 0 ? (
              <div className="text-center py-6">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Ingen nylig registrerte kompetansebevis</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentCompetencies.map((comp) => (
                  <div key={comp.id} className="flex justify-between items-center border-b pb-3">
                    <div>
                      <p className="font-medium">{comp.competenceType.name}</p>
                      <p className="text-sm text-muted-foreground">{comp.user.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{formatDate(comp.createdAt)}</p>
                      <p className={`text-xs px-2 py-0.5 rounded-full ${
                        comp.verificationStatus === 'VERIFIED' 
                          ? 'bg-green-100 text-green-800' 
                          : comp.verificationStatus === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {comp.verificationStatus === 'VERIFIED' 
                          ? 'Verifisert' 
                          : comp.verificationStatus === 'REJECTED'
                          ? 'Avvist'
                          : 'Venter på godkjenning'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <div className="flex gap-2 w-full">
              <Button asChild variant="outline" size="sm" className="flex-1">
                <Link href="/dashboard/competence/verify">
                  Verifiser kompetansebevis
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="flex-1">
                <Link href="/dashboard/competence/all">
                  Se alle
                </Link>
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
      
      {/* Handlingsknapper */}
      <div className="flex flex-wrap gap-3 pt-4">
        <Button asChild>
          <Link href="/dashboard/competence/report">
            <Download className="mr-2 h-4 w-4" />
            Generer rapport
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/competence/employees">
            <User className="mr-2 h-4 w-4" />
            Ansattoversikt
          </Link>
        </Button>
      </div>
    </div>
  )
}

// Hjelpefunksjon for å lage statistikkort
function StatsCard({ title, value, description, icon, isWarning = false }: { 
  title: string, 
  value: number, 
  description: string, 
  icon: React.ReactNode,
  isWarning?: boolean 
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`${isWarning && value > 0 ? 'bg-orange-100 text-orange-800' : 'bg-muted'} p-2 rounded-full`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${isWarning && value > 0 ? 'text-orange-600' : ''}`}>
          {value}
        </div>
        <p className="text-xs text-muted-foreground pt-1">
          {description}
        </p>
      </CardContent>
    </Card>
  )
}

// Funksjon for å hente statistikk fra databasen
async function getCompetenceStats(companyId: string) {
  // Hent aktuelle tall fra databasen
  const now = new Date()
  const threeMonthsFromNow = new Date(now)
  threeMonthsFromNow.setMonth(now.getMonth() + 3)

  const competenceCount = await prisma.competence.count({
    where: {
      user: { companyId }
    }
  })

  const expiringSoonCount = await prisma.competence.count({
    where: {
      user: { companyId },
      expiryDate: {
        gte: now,
        lte: threeMonthsFromNow
      }
    }
  })

  const verifiedCount = await prisma.competence.count({
    where: {
      user: { companyId },
      verificationStatus: 'VERIFIED'
    }
  })

  const pendingCount = await prisma.competence.count({
    where: {
      user: { companyId },
      verificationStatus: 'PENDING'
    }
  })

  return {
    total: competenceCount,
    expiringSoon: expiringSoonCount,
    verified: verifiedCount,
    pending: pendingCount
  }
}

// Funksjon for å hente utløpende kompetanser
async function getExpiringCompetencies(companyId: string) {
  const now = new Date()
  const threeMonthsFromNow = new Date(now)
  threeMonthsFromNow.setMonth(now.getMonth() + 3)

  return await prisma.competence.findMany({
    where: {
      user: { companyId },
      expiryDate: {
        gte: now,
        lte: threeMonthsFromNow
      }
    },
    include: {
      user: {
        select: {
          id: true,
          name: true
        }
      },
      competenceType: {
        select: {
          id: true,
          name: true,
          category: true
        }
      }
    },
    orderBy: {
      expiryDate: 'asc'
    },
    take: 5
  })
}

// Funksjon for å hente nylig registrerte kompetanser
async function getRecentCompetencies(companyId: string) {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  return await prisma.competence.findMany({
    where: {
      user: { companyId },
      createdAt: {
        gte: thirtyDaysAgo
      }
    },
    include: {
      user: {
        select: {
          id: true,
          name: true
        }
      },
      competenceType: {
        select: {
          id: true,
          name: true,
          category: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 5
  })
}

// Hjelpefunksjon for å beregne dager til utløp
function getDaysUntil(date: Date | null): number {
  if (!date) return 0
  const now = new Date()
  const expiryDate = new Date(date)
  const diffTime = expiryDate.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}