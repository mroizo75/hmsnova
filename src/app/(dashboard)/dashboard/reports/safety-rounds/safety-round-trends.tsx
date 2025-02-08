"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FindingSeverity } from "@prisma/client"
import { Line, Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface Props {
  data: Array<{
    id: string
    title: string
    description: string | null
    completedAt: Date | null
    findings: Array<{
      createdAt: string | number | Date
      id: string
      description: string
      severity: FindingSeverity
      status: string
      measures: Array<{
        id: string
        description: string
        completedAt: Date | null
        createdAt: Date
        status: string
      }>
    }>
  }>
}

export function SafetyRoundTrends({ data }: Props) {
  const monthlyData = getMonthlyData(data)
  const severityData = getSeverityData(data)

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Funn over tid</CardTitle>
        </CardHeader>
        <CardContent>
          <Line
            data={{
              labels: monthlyData.labels,
              datasets: [
                {
                  label: 'Antall funn',
                  data: monthlyData.values,
                  borderColor: 'rgb(75, 192, 192)',
                  tension: 0.1
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top' as const,
                }
              }
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fordeling av alvorlighetsgrad</CardTitle>
        </CardHeader>
        <CardContent>
          <Bar
            data={{
              labels: ['Lav', 'Middels', 'Høy', 'Kritisk'],
              datasets: [
                {
                  label: 'Antall funn',
                  data: [
                    severityData.LOW || 0,
                    severityData.MEDIUM || 0,
                    severityData.HIGH || 0,
                    severityData.CRITICAL || 0
                  ],
                  backgroundColor: [
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(255, 206, 86, 0.5)',
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(153, 102, 255, 0.5)'
                  ]
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top' as const,
                }
              }
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}

function getMonthlyData(data: Props['data']) {
  // Lag en map for å holde styr på antall funn per måned
  const monthlyFindings = new Map<string, number>()

  // Gå gjennom alle vernerunder og deres funn
  data.forEach(round => {
    round.findings.forEach(finding => {
      // Bruk finding.createdAt for å få riktig dato for funnet
      const date = new Date(finding.createdAt)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      // Øk telleren for denne måneden
      monthlyFindings.set(monthKey, (monthlyFindings.get(monthKey) || 0) + 1)
    })
  })

  // Sorter månedene kronologisk
  const sortedMonths = Array.from(monthlyFindings.keys()).sort()

  return {
    labels: sortedMonths.map(month => {
      const [year, monthNum] = month.split('-')
      return new Date(parseInt(year), parseInt(monthNum) - 1)
        .toLocaleString('no-NO', { month: 'short', year: '2-digit' })
    }),
    values: sortedMonths.map(month => monthlyFindings.get(month) || 0)
  }
}

function getSeverityData(data: Props['data']) {
  return data.flatMap(round => round.findings).reduce((acc, finding) => {
    acc[finding.severity] = (acc[finding.severity] || 0) + 1
    return acc
  }, {} as Record<FindingSeverity, number>)
} 