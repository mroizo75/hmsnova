"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

const data = [
  { name: "Utkast", value: 20 },
  { name: "Planlagt", value: 15 },
  { name: "Pågår", value: 30 },
  { name: "Fullført", value: 25 },
  { name: "Godkjent", value: 10 },
]

const COLORS = ["#9CA3AF", "#60A5FA", "#F59E0B", "#10B981", "#6366F1"]

export function StatusDistribution() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
} 