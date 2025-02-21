"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, AlertTriangle, FileCheck2 } from "lucide-react"

interface StatsCardsProps {
  stats: {
    users: Array<any>
    deviations: Array<{
      id: string
      title: string
      status: string
      createdAt: Date
      assignedTo: string | null
      severity: string
      description: string
    }>
    riskAssessments: Array<any>
    SJA: Array<any>
  } | null
}

export function StatsCards({ stats }: StatsCardsProps) {
  if (!stats) return null

  // Tell alle avvik som ikke er lukket
  const activeDeviations = stats.deviations.length

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ansatte</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.users.length}</div>
          <p className="text-xs text-muted-foreground">
            Aktive brukere i systemet
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avvik</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeDeviations}</div>
          <p className="text-xs text-muted-foreground">
            Aktive avvik
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Risikovurderinger</CardTitle>
          <FileCheck2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.riskAssessments.length}</div>
          <p className="text-xs text-muted-foreground">
            Totalt antall risikovurderinger
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">SJA</CardTitle>
          <FileCheck2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.SJA.length}</div>
          <p className="text-xs text-muted-foreground">
            Aktive sikker jobb analyser
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 