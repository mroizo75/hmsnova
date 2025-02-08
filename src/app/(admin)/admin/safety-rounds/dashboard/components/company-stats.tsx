"use client"

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip
} from "recharts"

const data = [
  {
    company: "Bedrift A",
    completed: 12,
    active: 3,
  },
  {
    company: "Bedrift B",
    completed: 8,
    active: 5,
  },
  // ... flere bedrifter
]

export function CompanyStats() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="company"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip />
        <Bar
          dataKey="completed"
          fill="#4F46E5"
          radius={[4, 4, 0, 0]}
          name="Fullførte"
        />
        <Bar
          dataKey="active"
          fill="#60A5FA"
          radius={[4, 4, 0, 0]}
          name="Aktive"
        />
      </BarChart>
    </ResponsiveContainer>
  )
} 