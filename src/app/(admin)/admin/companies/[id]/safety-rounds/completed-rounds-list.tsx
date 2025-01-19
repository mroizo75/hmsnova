"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils/date"
import { FileCheck, ChevronRight, AlertTriangle, CheckCircle, Download } from "lucide-react"
import { toast } from "sonner"
import { useParams } from "next/navigation"

interface CompletedRoundsListProps {
  safetyRounds: Array<{
    id: string
    title: string
    description: string | null
    status: string
    scheduledDate: Date | null
    dueDate: Date | null
    completedAt: Date | null
    findings: Array<{
      id: string
      severity: string
      status: string
      measures: Array<{
        completedAt: Date | null
      }>
    }>
  }>
}

function getSeverityCount(findings: CompletedRoundsListProps['safetyRounds'][0]['findings']) {
  return {
    low: findings.filter(f => f.severity === 'LOW').length,
    medium: findings.filter(f => f.severity === 'MEDIUM').length,
    high: findings.filter(f => f.severity === 'HIGH').length,
    critical: findings.filter(f => f.severity === 'CRITICAL').length
  }
}

export function CompletedRoundsList({ safetyRounds }: CompletedRoundsListProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const params = useParams()
  const companyId = params.id as string

  const completedRounds = safetyRounds.filter(round => 
    round.status === 'COMPLETED' || round.status === 'APPROVED'
  )

  const handleDownloadReport = async (roundId: string, title: string) => {
    try {
      setLoading(roundId)
      console.log('Downloading report with params:', { companyId, roundId }) // Debug logging
      
      const response = await fetch(
        `/api/admin/companies/${companyId}/safety-rounds/${roundId}/report`,
        {
          method: 'GET'
        }
      )

      if (!response.ok) throw new Error('Kunne ikke laste ned rapport')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Vernerunde-${title}-${formatDate(new Date())}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Rapport lastet ned')
    } catch (error) {
      console.error('Error downloading report:', error)
      toast.error('Kunne ikke laste ned rapport')
    } finally {
      setLoading(null)
    }
  }

  if (completedRounds.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        Ingen fullførte vernerunder
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {completedRounds.map(round => {
        const severityCounts = getSeverityCount(round.findings)
        const allMeasuresCompleted = round.findings.every(f => 
          f.measures.every(m => m.completedAt)
        )

        return (
          <div key={round.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold mb-2">{round.title}</h3>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Fullført: {round.completedAt ? formatDate(round.completedAt) : 'Ikke fullført'}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {severityCounts.high > 0 && (
                      <Badge variant="destructive">
                        {severityCounts.high} høy risiko
                      </Badge>
                    )}
                    {severityCounts.medium > 0 && (
                      <Badge variant="secondary">
                        {severityCounts.medium} middels risiko
                      </Badge>
                    )}
                    {severityCounts.low > 0 && (
                      <Badge variant="outline">
                        {severityCounts.low} lav risiko
                      </Badge>
                    )}
                    {allMeasuresCompleted && (
                      <Badge variant="outline" className="text-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Alle tiltak utført
                      </Badge>
                    )}
                    <Badge variant={round.status === 'APPROVED' ? 'secondary' : 'outline'}>
                      {round.status === 'APPROVED' ? 'Godkjent' : 'Fullført'}
                    </Badge>
                    {round.completedAt && (
                      <div className="text-sm text-muted-foreground">
                        Fullført: {formatDate(round.completedAt)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDownloadReport(round.id, round.title)}
                  disabled={loading === round.id}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {loading === round.id ? 'Laster...' : 'Last ned rapport'}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => {
                    window.location.href = `/admin/companies/${companyId}/safety-rounds/${round.id}`
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
} 