"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, TrendingUp, AlertTriangle, Building2 } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"
import { format, subMonths, eachMonthOfInterval } from "date-fns"
import { nb } from "date-fns/locale"
import { ActionPlan } from "./action-plan"

interface Deviation {
  id: string
  title: string
  description: string
  severity: string
  status: string
  createdAt: Date
  company: {
    name: string
  } | null
  measures: {
    id: string
    status: string
  }[]
}

interface Props {
  category: string
  deviations: Deviation[]
  selectedCompanyId?: string
}

export function DetailedAnalysis({ category, deviations, selectedCompanyId }: Props) {
  // Beregn statistikk
  const totalDeviations = deviations.length
  const affectedCompanies = new Set(deviations.map(d => d.company?.name)).size
  const averageResolutionTime = calculateAverageResolutionTime(deviations)
  const monthlyData = generateMonthlyData(deviations)
  const severityDistribution = calculateSeverityDistribution(deviations)

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{decodeURIComponent(category)}</h1>
          <p className="text-muted-foreground">
            {selectedCompanyId 
              ? `Analyse for ${deviations[0]?.company?.name || 'valgt bedrift'}`
              : 'Analyse på tvers av alle bedrifter'
            }
          </p>
        </div>
        <Brain className="h-8 w-8 text-muted-foreground" />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Totalt antall avvik"
          value={totalDeviations}
          icon={<AlertTriangle className="h-4 w-4" />}
        />
        <StatCard
          title="Berørte bedrifter"
          value={affectedCompanies}
          icon={<Building2 className="h-4 w-4" />}
        />
        <StatCard
          title="Gjennomsnittlig løsningstid"
          value={`${averageResolutionTime} dager`}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          title="Åpne avvik"
          value={deviations.filter(d => d.status === 'AAPEN').length}
          icon={<AlertTriangle className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Trend over tid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tickFormatter={(value) => format(new Date(value), 'MMM', { locale: nb })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => format(new Date(value), 'MMMM yyyy', { locale: nb })}
                  />
                  <Line type="monotone" dataKey="count" stroke="#0ea5e9" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alvorlighetsgrad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(severityDistribution).map(([severity, count]) => (
                <div key={severity} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize">{severity.toLowerCase()}</span>
                    <span>{Math.round((count / totalDeviations) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getSeverityColor(severity)}`}
                      style={{ width: `${(count / totalDeviations) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Siste avvik</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deviations.slice(0, 5).map(deviation => (
              <div key={deviation.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{deviation.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {deviation.description}
                    </p>
                  </div>
                  <span className={`text-sm ${getSeverityTextColor(deviation.severity)}`}>
                    {deviation.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <ActionPlan category={category} deviations={deviations} />
    </div>
  )
}

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}

function calculateAverageResolutionTime(deviations: Deviation[]): number {
  const completedDeviations = deviations.filter(d => d.status === 'LUKKET')
  if (completedDeviations.length === 0) return 0

  const totalDays = completedDeviations.reduce((acc, dev) => {
    const created = new Date(dev.createdAt)
    const closed = new Date() // Ideelt sett skulle vi brukt closedAt, men den finnes ikke i datamodellen ennå
    return acc + Math.floor((closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
  }, 0)

  return Math.round(totalDays / completedDeviations.length)
}

function generateMonthlyData(deviations: Deviation[]) {
  const months = eachMonthOfInterval({
    start: subMonths(new Date(), 11),
    end: new Date()
  })

  return months.map(month => ({
    month: month.toISOString(),
    count: deviations.filter(d => 
      new Date(d.createdAt).getMonth() === month.getMonth() &&
      new Date(d.createdAt).getFullYear() === month.getFullYear()
    ).length
  }))
}

function calculateSeverityDistribution(deviations: Deviation[]) {
  return deviations.reduce((acc, dev) => {
    acc[dev.severity] = (acc[dev.severity] || 0) + 1
    return acc
  }, {} as Record<string, number>)
}

function getSeverityColor(severity: string): string {
  switch (severity.toUpperCase()) {
    case 'HIGH':
      return 'bg-red-500'
    case 'MEDIUM':
      return 'bg-yellow-500'
    case 'LOW':
      return 'bg-blue-500'
    default:
      return 'bg-gray-500'
  }
}

function getSeverityTextColor(severity: string): string {
  switch (severity.toUpperCase()) {
    case 'HIGH':
      return 'text-red-500'
    case 'MEDIUM':
      return 'text-yellow-500'
    case 'LOW':
      return 'text-blue-500'
    default:
      return 'text-gray-500'
  }
} 