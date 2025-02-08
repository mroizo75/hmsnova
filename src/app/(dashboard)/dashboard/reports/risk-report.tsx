"use client"

import { Card } from "@/components/ui/card"
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line, AreaChart, Area 
} from 'recharts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { StatsItem } from "./reports-client"

interface RiskStat {
  status: string
  _count: {
    _all: number
  }
  severity: string
  category: string
  createdAt: string
  mitigationStatus: string
  residualRisk: number
}

interface TrendData {
  date: string
  highRisks: number
  mediumRisks: number
  lowRisks: number
  mitigatedRisks: number
}

interface Props {
  stats: StatsItem[]
  trends: {
    date: string
    maxRiskLevel: number
    assessmentCount: number
    highRiskCount: number
  }[]
}

export function RiskReport({ stats, trends }: Props) {
  // Konverter stats til riktig format for grafen
  const data = stats?.map(item => ({
    name: item.status,
    value: item._count._all,
    color: getStatusColor(item.status)
  })) || []

  const totalAssessments = data.reduce((sum, item) => sum + item.value, 0)
  const completedAssessments = data.find(item => item.name === 'COMPLETED')?.value || 0
  const inProgressAssessments = data.find(item => item.name === 'IN_PROGRESS')?.value || 0

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Totalt antall risikovurderinger</h3>
          <p className="text-3xl font-bold mt-2">{totalAssessments}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Under arbeid</h3>
          <p className="text-3xl font-bold mt-2 text-amber-500">{inProgressAssessments}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Fullførte</h3>
          <p className="text-3xl font-bold mt-2 text-emerald-600">{completedAssessments}</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Status på risikovurderinger</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar 
              dataKey="value" 
              fill="#16a34a"
              label={{ position: 'top' }}
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Detaljer</h3>
        <div className="space-y-4">
          {data.map((item) => (
            <div key={item.name} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span>{getStatusLabel(item.name)}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-medium">{item.value}</span>
                <span className="text-muted-foreground">
                  {Math.round((item.value / totalAssessments) * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Risikonivå Trender</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={trends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 25]} />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="maxRiskLevel" 
              stroke="#ef4444" 
              name="Høyeste risikonivå" 
            />
            <Line 
              type="monotone" 
              dataKey="highRiskCount" 
              stroke="#f59e0b" 
              name="Antall høyrisiko" 
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'DRAFT': return '#f59e0b'
    case 'COMPLETED': return '#10b981'
    case 'IN_PROGRESS': return '#3b82f6'
    case 'SCHEDULED': return '#8b5cf6'
    case 'CLOSED': return '#6b7280'
    case 'CANCELLED': return '#ef4444'
    default: return '#6b7280'
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'DRAFT': return 'Utkast'
    case 'COMPLETED': return 'Fullført'
    case 'IN_PROGRESS': return 'Under arbeid'
    case 'SCHEDULED': return 'Planlagt'
    case 'CLOSED': return 'Lukket'
    case 'CANCELLED': return 'Kansellert'
    default: return status
  }
}

// Hjelpefunksjoner for beregninger
function calculateRiskIndex(stats: RiskStat[]): number {
  // Implementer beregning basert på alvorlighetsgrad og sannsynlighet
  return 75 // Eksempel
}

function countRisksByLevel(stats: RiskStat[], level: string): number {
  return stats.filter(stat => stat.severity === level).length
}

function countMitigationStatus(stats: RiskStat[], status: string): number {
  return stats.filter(stat => stat.mitigationStatus === status).length
} 