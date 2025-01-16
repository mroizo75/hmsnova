"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils/date"
import { Button } from "@/components/ui/button"
import { FileText, AlertTriangle, CheckCircle } from "lucide-react"
import Link from "next/link"

interface SafetyRoundReport {
  id: string
  title: string
  description: string | null
  completedAt: Date
  findings: Array<{
    id: string
    description: string
    severity: string
    status: string
    measures: Array<{
      id: string
      description: string
      completedAt: Date | null
    }>
  }>
}

interface SafetyRoundReportsProps {
  reports: SafetyRoundReport[]
}

export function SafetyRoundReports({ reports }: SafetyRoundReportsProps) {
  function getSeverityCount(findings: SafetyRoundReport['findings']) {
    return {
      high: findings.filter(f => f.severity === 'HIGH').length,
      medium: findings.filter(f => f.severity === 'MEDIUM').length,
      low: findings.filter(f => f.severity === 'LOW').length,
    }
  }

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <FileText className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Ingen vernerunderapporter</h2>
        <p className="text-muted-foreground">
          Det er ikke gjennomført noen vernerunder ennå
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Vernerunderapporter</h1>
      </div>

      <div className="grid gap-6">
        {reports.map((report) => {
          const severityCounts = getSeverityCount(report.findings)
          const hasHighSeverity = severityCounts.high > 0

          return (
            <Card key={report.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      {report.title}
                      {hasHighSeverity && (
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                      )}
                    </CardTitle>
                    <div className="text-sm text-muted-foreground">
                      Gjennomført {formatDate(report.completedAt)}
                    </div>
                  </div>
                  <Link href={`/dashboard/safety-rounds/${report.id}`}>
                    <Button variant="outline">Se rapport</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    {severityCounts.high > 0 && (
                      <Badge variant="destructive">
                        {severityCounts.high} høy risiko
                      </Badge>
                    )}
                    {severityCounts.medium > 0 && (
                      <Badge variant="warning">
                        {severityCounts.medium} middels risiko
                      </Badge>
                    )}
                    {severityCounts.low > 0 && (
                      <Badge variant="secondary">
                        {severityCounts.low} lav risiko
                      </Badge>
                    )}
                  </div>
                  {report.description && (
                    <p className="text-sm text-muted-foreground">
                      {report.description}
                    </p>
                  )}
                  <div className="text-sm">
                    <span className="font-medium">Status på tiltak: </span>
                    {report.findings.every(f => f.measures.every(m => m.completedAt)) ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Alle tiltak er gjennomført
                      </span>
                    ) : (
                      <span className="text-yellow-600">
                        Noen tiltak gjenstår
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
} 