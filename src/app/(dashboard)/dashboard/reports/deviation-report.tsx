"use client"

import { Card } from "@/components/ui/card"
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts'
import { statusLabels, statusColors } from "@/lib/constants/deviations"
import { StatsItem } from "./reports-client"

interface DeviationStat {
  status: string
  _count: {
    _all: number
  }
}

interface Props {
  stats: StatsItem[]
}

export function DeviationReport({ stats }: Props) {
  const data = stats.map(item => ({
    name: item.status === 'DRAFT' ? 'Under arbeid' :
          item.status === 'COMPLETED' ? 'Fullført' :
          item.status === 'APPROVED' ? 'Godkjent' :
          item.status === 'NEEDS_REVIEW' ? 'Trenger gjennomgang' :
          item.status === 'OPEN' ? 'Åpen' :
          item.status,
    antall: item._count._all,
    color: item.status === 'DRAFT' ? '#f59e0b' :      // Gul
           item.status === 'COMPLETED' ? '#10b981' :   // Grønn
           item.status === 'APPROVED' ? '#3b82f6' :    // Blå
           item.status === 'NEEDS_REVIEW' ? '#ef4444' : // Rød
           item.status === 'OPEN' ? '#6366f1' :        // Indigo
           '#9ca3af'                                   // Grå (default)
  }))

  const totalDeviations = data.reduce((sum, item) => sum + item.antall, 0)
  const openDeviations = data.find(item => item.name === 'Åpen')?.antall || 0
  const completedDeviations = data.find(item => item.name === 'Fullført')?.antall || 0

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Totalt antall avvik</h3>
          <p className="text-3xl font-bold mt-2">{totalDeviations}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Åpne avvik</h3>
          <p className="text-3xl font-bold mt-2 text-yellow-600">{openDeviations}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Fullførte avvik</h3>
          <p className="text-3xl font-bold mt-2 text-green-600">{completedDeviations}</p>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-6">Avvik etter status</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
            />
            <Legend />
            <Bar 
              dataKey="antall" 
              name="Antall avvik"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
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
                  {Math.round((item.antall / totalDeviations) * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
} 