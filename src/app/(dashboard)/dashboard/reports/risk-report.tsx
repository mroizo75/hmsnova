"use client"

import { Card } from "@/components/ui/card"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts'

interface RiskReportProps {
  stats: {
    status: string
    _count: number
  }[]
}

export function RiskReport({ stats }: RiskReportProps) {
  const data = stats.map(item => ({
    name: item.status === 'DRAFT' ? 'Under arbeid' :
          item.status === 'COMPLETED' ? 'Fullført' :
          item.status === 'APPROVED' ? 'Godkjent' :
          item.status === 'NEEDS_REVIEW' ? 'Trenger gjennomgang' :
          item.status,
    antall: item._count,
    color: item.status === 'DRAFT' ? '#f59e0b' :
           item.status === 'COMPLETED' ? '#10b981' :
           item.status === 'APPROVED' ? '#3b82f6' :
           item.status === 'NEEDS_REVIEW' ? '#ef4444' :
           '#6b7280'
  }))

  const totalAssessments = data.reduce((sum, item) => sum + item.antall, 0)
  const completedAssessments = data.find(item => item.name === 'Fullført')?.antall || 0
  const inProgressAssessments = data.find(item => item.name === 'Under arbeid')?.antall || 0

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
              dataKey="antall" 
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
                <span>{item.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-medium">{item.antall}</span>
                <span className="text-muted-foreground">
                  {Math.round((item.antall / totalAssessments) * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
} 