"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "./components/overview"
import { RecentRounds } from "./components/recent-rounds"
import { StatusDistribution } from "./components/status-distribution"
import { CompanyStats } from "./components/company-stats"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { SAFETY_ROUND_STATUSES } from "@/lib/constants/safety-round-statuses"

interface DashboardData {
  totalCount: number
  previousMonthCount: number
  activeCount: number
  dueThisWeek: number
  monthlyFindings: number
  criticalFindings: number
  completionRate: number
  previousCompletionRate: number
  statusDistribution: Array<{ status: string; _count: number }>
  recentRounds: any[]
  companyStats: any[]
}

export default function SafetyRoundsDashboard() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/admin/safety-rounds/dashboard")
      if (!response.ok) throw new Error("Kunne ikke hente dashboard data")
      const data = await response.json()
      setData(data)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast.error("Kunne ikke hente dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 100
    return Math.round(((current - previous) / previous) * 100)
  }

  if (loading || !data) {
    return <DashboardSkeleton />
  }

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Vernerunder Dashboard</h1>
        <p className="text-muted-foreground">
          Oversikt over vernerunder på tvers av bedrifter
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Totalt Antall Vernerunder
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalCount}</div>
            <p className="text-xs text-muted-foreground">
              {calculateGrowth(data.totalCount, data.previousMonthCount)}% fra forrige måned
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Aktive Vernerunder
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeCount}</div>
            <p className="text-xs text-muted-foreground">
              {data.dueThisWeek} forfaller denne uken
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Funn denne måneden
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.monthlyFindings}</div>
            <p className="text-xs text-muted-foreground">
              {data.criticalFindings} kritiske funn
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Gjennomføringsgrad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {calculateGrowth(data.completionRate, data.previousCompletionRate)}% fra forrige måned
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Oversikt</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Status Fordeling</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusDistribution />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Siste Vernerunder</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentRounds />
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Bedriftsstatistikk</CardTitle>
          </CardHeader>
          <CardContent>
            <CompanyStats />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="container py-6 space-y-6">
      <div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 mt-2" />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-4 w-24 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[350px] w-full" />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 