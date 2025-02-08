"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SafetyRoundReport } from "@/types/safety-rounds"
import { AlertTriangle, Clock, CheckCircle, BarChart3 } from "lucide-react"
import { FindingSeverity, Status } from "@prisma/client"

interface Props {
  stats: Array<{
    id: string
    title: string
    description: string | null
    completedAt: Date | null
    findings: Array<{
      id: string
      description: string
      severity: FindingSeverity
      status: string
      createdAt: Date
      deviation?: {
        id: string
        status: Status
        createdAt: Date
        closedAt: Date | null
        source: string
        sourceId: string
      }
      measures: Array<{
        id: string
        description: string
        completedAt: Date | null
        createdAt: Date
        status: string
      }>
      images: Array<{
        id: string
        url: string
      }>
    }>
  }>
}

export function SafetyRoundStats({ stats }: Props) {
  const totalFindings = stats.reduce((acc, round) => acc + round.findings.length, 0)
  
  // Debug logging
  console.log('SafetyRoundStats - Raw data:', stats)
  
  const completedFindings = stats.reduce((acc, round) => 
    acc + round.findings.filter(f => 
      f.deviation?.status === Status.CLOSED && 
      f.deviation?.id
    ).length, 0)
  
  // Debug for lukkede funn
  console.log('SafetyRoundStats - Completed findings:', {
    total: completedFindings,
    findings: stats.flatMap(round => 
      round.findings.filter(f => f.deviation?.status === Status.CLOSED)
    ).map(f => ({
      id: f.id,
      deviationId: f.deviation?.id,
      status: f.deviation?.status,
      createdAt: f.createdAt,
      closedAt: f.deviation?.closedAt
    }))
  })

  const avgCompletionTime = calculateAverageCompletionTime(stats)
  console.log('SafetyRoundStats - Average completion time:', avgCompletionTime)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Totalt antall funn</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalFindings}</div>
          <p className="text-xs text-muted-foreground">Siste 12 måneder</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Gjennomsnittlig lukketid</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgCompletionTime} dager</div>
          <p className="text-xs text-muted-foreground">Fra funn til lukking av avvik</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Lukkede funn</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.round((completedFindings / totalFindings) * 100)}%
          </div>
          <p className="text-xs text-muted-foreground">Av totalt {totalFindings} funn</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Mest alvorlige funn</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{getMostSeverityFindings(stats)}</div>
          <p className="text-xs text-muted-foreground">Høy/kritisk alvorlighetsgrad</p>
        </CardContent>
      </Card>
    </div>
  )
}

function calculateAverageCompletionTime(stats: Props['stats']) {
  const closedFindings = stats.flatMap(round => 
    round.findings.filter(f => 
      f.deviation?.status === Status.CLOSED && 
      f.deviation?.id && 
      f.deviation?.closedAt
    ))
  
  if (closedFindings.length === 0) return 0

  const totalDays = closedFindings.reduce((acc, finding) => {
    if (!finding.deviation?.closedAt) return acc
    const days = Math.floor(
      (new Date(finding.deviation.closedAt).getTime() - new Date(finding.createdAt).getTime()) 
      / (1000 * 60 * 60 * 24)
    )
    return acc + days
  }, 0)

  return Math.round(totalDays / closedFindings.length)
}

function getMostSeverityFindings(stats: Props['stats']) {
  const highSeverityFindings = stats.flatMap(round => 
    round.findings.filter(f => f.severity === 'HIGH' || f.severity === 'CRITICAL'))
  return highSeverityFindings.length
} 