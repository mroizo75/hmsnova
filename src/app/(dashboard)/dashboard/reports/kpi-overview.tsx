"use client"

import { Card } from "@/components/ui/card"
import { StatsItem } from "./reports-client"
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts'

interface Props {
  stats: [StatsItem[], StatsItem[], any[]]  // [deviations, riskAssessments, monthlyStats]
}

export function KPIOverview({ stats }: Props) {
  const [deviationStats, riskAssessmentStats, monthlyStats] = stats

  // Beregn KPIer
  const totalDeviations = deviationStats.reduce((sum, stat) => sum + stat._count._all, 0)
  const openDeviations = deviationStats.find(stat => stat.status === 'OPEN')?._count._all || 0
  const completedDeviations = deviationStats.find(stat => stat.status === 'COMPLETED')?._count._all || 0
  const deviationCompletionRate = totalDeviations ? (completedDeviations / totalDeviations * 100).toFixed(1) : 0

  const totalRiskAssessments = riskAssessmentStats.reduce((sum, stat) => sum + stat._count._all, 0)
  const completedRiskAssessments = riskAssessmentStats.find(stat => stat.status === 'COMPLETED')?._count._all || 0
  const riskCompletionRate = totalRiskAssessments ? (completedRiskAssessments / totalRiskAssessments * 100).toFixed(1) : 0

  // Forbered data for grafer
  const monthlyData = monthlyStats.map((item: any) => ({
    month: new Date(item.createdAt).toLocaleString('nb-NO', { month: 'short' }),
    antall: item._count._all,
  }))

  const statusData = deviationStats.map(item => ({
    status: item.status === 'OPEN' ? 'Åpne' :
           item.status === 'IN_PROGRESS' ? 'Under behandling' :
           item.status === 'COMPLETED' ? 'Fullført' : item.status,
    antall: item._count._all
  }))

  return (
    <div className="space-y-6">
      {/* KPI Kort */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Totalt antall avvik</h3>
          <p className="text-3xl font-bold mt-2">{totalDeviations}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {deviationCompletionRate}% fullført
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Åpne avvik</h3>
          <p className="text-3xl font-bold mt-2 text-yellow-600">{openDeviations}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Krever oppfølging
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Risikovurderinger</h3>
          <p className="text-3xl font-bold mt-2">{totalRiskAssessments}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {riskCompletionRate}% fullført
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">HMS-aktiviteter</h3>
          <p className="text-3xl font-bold mt-2">{completedRiskAssessments + completedDeviations}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Totalt gjennomført
          </p>
        </Card>
      </div>

      {/* Grafer */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">HMS-hendelser per måned</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="antall" 
                stroke="#16a34a" 
                name="Antall hendelser"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Avvik etter status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="antall" 
                fill="#16a34a" 
                name="Antall avvik"
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  )
} 