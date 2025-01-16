"use client"

import { Card } from "@/components/ui/card"
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts'
import { statusLabels, statusColors } from "@/lib/constants/deviations"

interface DeviationReportProps {
  stats: {
    status: string
    _count: number
  }[]
}

export function DeviationReport({ stats }: DeviationReportProps) {
  const data = stats.map(item => ({
    name: statusLabels[item.status] || item.status,
    value: item._count,
    color: statusColors[item.status]?.split(' ')[0].replace('bg-', '#') || '#gray-500'
  }))

  const totalDeviations = data.reduce((sum, item) => sum + item.value, 0)
  const openDeviations = data.find(item => item.name === statusLabels.OPEN)?.value || 0
  const completedDeviations = data.find(item => item.name === statusLabels.COMPLETED)?.value || 0

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
        <h3 className="text-lg font-semibold mb-4">Fordeling av avvik etter status</h3>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={150}
              label={({
                cx,
                cy,
                midAngle,
                innerRadius,
                outerRadius,
                value,
                index
              }) => {
                const RADIAN = Math.PI / 180
                const radius = 25 + innerRadius + (outerRadius - innerRadius)
                const x = cx + radius * Math.cos(-midAngle * RADIAN)
                const y = cy + radius * Math.sin(-midAngle * RADIAN)

                return (
                  <text
                    x={x}
                    y={y}
                    fill="#888"
                    textAnchor={x > cx ? 'start' : 'end'}
                    dominantBaseline="central"
                  >
                    {`${data[index].name} (${value})`}
                  </text>
                )
              }}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
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
                <span className="font-medium">{item.value}</span>
                <span className="text-muted-foreground">
                  {Math.round((item.value / totalDeviations) * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
} 