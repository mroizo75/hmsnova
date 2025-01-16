import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, ShieldAlert, ClipboardCheck } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { RecentUsers } from "./recent-users"
import { ActivityFeed } from "./activity-feed"
import { AIInsights } from "./ai-insights"
import { OpenAI } from "openai"
import { headers } from 'next/headers'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  // Hent statistikk
  const stats = await prisma.$transaction([
    prisma.company.count(),
    prisma.user.count(),
    prisma.deviation.count(),
    prisma.safetyRound.count(),
  ])

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

  // Hent og analyser avvik direkte
  let analysisData = { insights: [], totalDeviations: 0 }
  try {
    const deviations = await prisma.deviation.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        severity: true,
        createdAt: true,
        company: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // Grupper avvik etter kategori
    const categorizedDeviations = deviations.reduce((acc, dev) => {
      const category = dev.category || 'Ukategorisert'
      if (!acc[category]) {
        acc[category] = {
          count: 0,
          companies: new Set(),
          descriptions: []
        }
      }
      acc[category].count++
      acc[category].companies.add(dev.company?.id)
      acc[category].descriptions.push(dev.description)
      return acc
    }, {} as Record<string, { count: number; companies: Set<string>; descriptions: string[] }>)

    // Analyser hver kategori
    const insights = await Promise.all(
      Object.entries(categorizedDeviations).map(async ([category, data]) => {
        const prompt = `
          Analyser følgende informasjon om HMS-avvik:
          Kategori: ${category}
          Antall avvik: ${data.count}
          Antall berørte bedrifter: ${data.companies.size}
          
          Beskrivelser av avvikene:
          ${data.descriptions.join('\n')}
          
          Gi en kort analyse som inkluderer:
          1. Hovedutfordringen
          2. Mulige årsaker
          3. Konkret anbefaling for forbedring
          4. Vurder alvorlighetsgrad (lav/medium/høy)
          5. Vurder trend (økende/synkende/stabil)
          
          Svar i JSON format med følgende struktur:
          {
            "description": "kort beskrivelse av hovedutfordringen",
            "severity": "low/medium/high",
            "trend": "increasing/decreasing/stable",
            "recommendation": "konkret anbefaling",
            "confidence": 0.0-1.0
          }
        `

        const completion = await openai.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "gpt-4-1106-preview",
          response_format: { type: "json_object" }
        })

        const content = completion.choices[0]?.message?.content
        if (!content) {
          throw new Error('Ingen respons fra OpenAI')
        }

        const analysis = JSON.parse(content)
        return {
          id: Math.random().toString(36).substr(2, 9),
          category,
          affectedCompanies: data.companies.size,
          ...analysis
        }
      })
    )

    analysisData = {
      insights,
      totalDeviations: deviations.length
    }
  } catch (error) {
    console.error('Error analyzing deviations:', error)
  }

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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <AIInsights 
          insights={analysisData.insights} 
          totalDeviations={analysisData.totalDeviations} 
        />
        
        <Card className="col-span-4">
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

        <Card className="col-span-3">
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