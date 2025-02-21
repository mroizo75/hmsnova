"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface HMSStatsProps {
  stats: {
    closedDeviations: number
    avgProcessingTime: string
    activeMeasures: number
    docsUpdatedPercent: number
  }
}

export function HMSStats({ stats }: HMSStatsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>HMS-status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm">Avvik lukket siste 30 dager</span>
            <span className="font-medium">{stats.closedDeviations}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Gjennomsnittlig behandlingstid</span>
            <span className="font-medium">{stats.avgProcessingTime} dager</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Aktive tiltak</span>
            <span className="font-medium">{stats.activeMeasures}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">HMS-dokumenter oppdatert</span>
            <span className="font-medium">{stats.docsUpdatedPercent}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 