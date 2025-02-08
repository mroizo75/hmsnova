import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, ShieldAlert, ClipboardCheck } from "lucide-react"
import { RecentUsers } from "./recent-users"
import { ActivityFeed } from "./activity-feed"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  // Behold bare grunnleggende statistikk
  const stats = await prisma.$transaction([
    prisma.company.count(),
    prisma.user.count(),
    prisma.deviation.count(),
    prisma.safetyRound.count(),
  ])

  // Hent kategorier for avvik
  const categories = await prisma.deviation.groupBy({
    by: ['category'],
    _count: true,
    orderBy: {
      _count: {
        category: 'desc'
      }
    }
  })

  // Hent siste brukere
  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      company: {
        select: {
          name: true
        }
      }
    }
  })

  // Hent siste aktiviteter (avvik, vernerunder, etc.)
  const recentActivity = await prisma.$transaction([
    prisma.deviation.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        createdAt: true,
        company: {
          select: { name: true }
        }
      }
    }),
    prisma.safetyRound.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        createdAt: true,
        company: {
          select: { name: true }
        }
      }
    })
  ])

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Oversikt over systemets aktiviteter og statistikk
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Bedrifter</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats[0]}</div>
            <p className="text-xs text-muted-foreground">
              Registrerte bedrifter i systemet
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Brukere</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats[1]}</div>
            <p className="text-xs text-muted-foreground">
              Totalt antall brukere
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Avvik</CardTitle>
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats[2]}</div>
            <p className="text-xs text-muted-foreground">
              Registrerte avvik
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Vernerunder</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats[3]}</div>
            <p className="text-xs text-muted-foreground">
              Gjennomførte vernerunder
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map(cat => (
          <Card key={cat.category}>
            <CardHeader>
              <CardTitle className="text-sm font-medium">{cat.category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold">{cat._count}</div>
                <Link href={`/admin/dashboard/${encodeURIComponent(cat.category)}`}>
                  <Button variant="outline">
                    Analyser
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Siste aktiviteter</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityFeed 
              deviations={recentActivity[0]} 
              safetyRounds={recentActivity[1]} 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nyeste brukere</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentUsers users={recentUsers} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 