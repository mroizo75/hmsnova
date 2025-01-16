"use client"

import { Card } from "@/components/ui/card"
import { 
  LineChart, 
  BarChart, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts'

interface KPIOverviewProps {
  stats: any[] // TODO: Definere typer
}

export function KPIOverview({ stats }: KPIOverviewProps) {
  // Behandle data for grafer
  const monthlyData = stats[2].map((item: any) => ({
    month: new Date(item.createdAt).toLocaleString('nb-NO', { month: 'short' }),
    count: item._count
  }))

  const statusData = stats[0].map((item: any) => ({
    status: item.status,
    count: item._count
  }))

  return (
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
            <Line type="monotone" dataKey="count" stroke="#16a34a" />
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
            <Bar dataKey="count" fill="#16a34a" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
} 