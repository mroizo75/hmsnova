import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { Separator } from "@/components/ui/separator"
import { Award, BookUser, School, FileCheck, User } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function CompetencePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user || !['ADMIN', 'SUPPORT', 'COMPANY_ADMIN'].includes(session.user.role)) {
    redirect('/login')
  }

  // Hent statistikk over kompetanse
  const stats = await getCompetenceStats(session.user.companyId)

  return (
    <div className="space-y-6 p-6 pb-16">
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <Award className="h-6 w-6 text-muted-foreground" />
          <h2 className="text-2xl font-bold tracking-tight">Kompetansestyring</h2>
        </div>
        <p className="text-muted-foreground">
          Administrer kompetansetyper, sertifiseringer og kurs for ansatte
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
          icon={<FileCheck className="h-4 w-4" />}
          isWarning={stats.expiringSoon > 0}
        />
        <StatsCard
          title="Kompetansetyper"
          value={stats.competenceTypes}
          description="Aktive kompetansetyper"
          icon={<BookUser className="h-4 w-4" />}
        />
        <StatsCard
          title="Kurs"
          value={stats.courses}
          description="Tilgjengelige kurs"
          icon={<School className="h-4 w-4" />}
        />
      </div>
      
      {/* Hovedmoduler */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Kompetansetyper</CardTitle>
            <CardDescription>
              Administrer ulike typer kompetanse og sertifikater
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button asChild variant="default">
                <Link href="/admin/competence/types">
                  Administrer kompetansetyper
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/competence/types/new">
                  <span>Opprett ny</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Kurs og opplæring</CardTitle>
            <CardDescription>
              Administrer kurs og opplæring for kompetanseheving
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button asChild variant="default">
                <Link href="/admin/competence/courses">
                  Administrer kurs
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/competence/courses/new">
                  <span>Opprett nytt</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Ansattes kompetanse</CardTitle>
            <CardDescription>
              Oversikt over ansattes kompetanse og sertifikater
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="default">
              <Link href="/admin/competence/employees">
                <User className="mr-2 h-4 w-4" />
                <span>Se oversikt</span>
              </Link>
            </Button>
          </CardContent>
        </Card>
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

  const competenceTypeCount = await prisma.competenceType.count({
    where: { companyId, isActive: true }
  })

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

  const courseCount = await prisma.course.count({
    where: { companyId, isActive: true }
  })

  return {
    total: competenceCount,
    expiringSoon: expiringSoonCount,
    competenceTypes: competenceTypeCount,
    courses: courseCount
  }
} 