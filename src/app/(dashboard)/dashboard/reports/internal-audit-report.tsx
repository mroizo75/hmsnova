"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"
import { useState } from "react"
import { pdf } from "@react-pdf/renderer"
import { AnnualReportDocument } from "@/components/reports/annual-report"

export interface InternalAuditData {
  handbook: {
    version: number
    lastUpdated: string
    changes: Array<{
      date: string
      description: string
    }>
  }
  deviations: {
    total: number
    bySeverity: Array<{
      severity: string
      count: number
    }>
    implementedMeasures: number
    companyId: string
  }
  riskAssessments: {
    total: number
    completed: number
    highRiskCount: number
    implementedMeasures: number
  }
  safetyRounds: {
    total: number
    findings: number
    completedMeasures: number
  }
  activities: {
    training: Array<{
      name: string
      date: string
      participants: number
    }>
    inspections: number
  }
  goals: {
    achieved: number
    total: number
    nextYearGoals: string[]
  }
}

interface Props {
  data: InternalAuditData
}

export function InternalAuditReport({ data }: Props) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    try {
      setIsExporting(true)
      const blob = await pdf(
        <AnnualReportDocument data={data} />
      ).toBlob()
      
      // Last ned PDF
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `hms-arsrapport-${new Date().getFullYear()}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting report:', error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">HMS Årsrapport {new Date().getFullYear()}</h2>
        <Button 
          onClick={handleExport} 
          disabled={isExporting}
        >
          <FileDown className="w-4 h-4 mr-2" />
          {isExporting ? 'Eksporterer...' : 'Eksporter PDF'}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* HMS-håndbok */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">HMS-håndbok</h3>
          <div className="space-y-2">
            <p>Versjon: {data.handbook.version}</p>
            <p>Sist oppdatert: {new Date(data.handbook.lastUpdated).toLocaleDateString('nb-NO')}</p>
            {data.handbook.changes.length > 0 && (
              <>
                <p className="font-medium mt-4">Endringer:</p>
                <ul className="list-disc pl-4">
                  {data.handbook.changes.map((change, i) => (
                    <li key={i}>
                      {change.description} ({new Date(change.date).toLocaleDateString('nb-NO')})
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </Card>

        {/* Avvik */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Avvik og Hendelser</h3>
          <div className="space-y-2">
            <p>Totalt antall: {data.deviations.total}</p>
            <p>Gjennomførte tiltak: {data.deviations.implementedMeasures}</p>
            {data.deviations.bySeverity.length > 0 && (
              <>
                <p className="font-medium mt-4">Fordeling:</p>
                <ul className="list-disc pl-4">
                  {data.deviations.bySeverity.map((item, i) => (
                    <li key={i}>
                      {item.severity}: {item.count}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </Card>

        {/* Risikovurderinger */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Risikovurderinger</h3>
          <div className="space-y-2">
            <p>Totalt gjennomført: {data.riskAssessments.total}</p>
            <p>Fullførte: {data.riskAssessments.completed}</p>
            <p>Høyrisiko funn: {data.riskAssessments.highRiskCount}</p>
            <p>Implementerte tiltak: {data.riskAssessments.implementedMeasures}</p>
          </div>
        </Card>

        {/* Vernerunder */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Vernerunder og HMS-aktiviteter</h3>
          <div className="space-y-2">
            <p>Gjennomførte vernerunder: {data.safetyRounds.total}</p>
            <p>Registrerte funn: {data.safetyRounds.findings}</p>
            <p>Lukkede funn: {data.safetyRounds.completedMeasures}</p>
            <p>Andre inspeksjoner: {data.activities.inspections}</p>
          </div>
        </Card>

        {/* HMS-mål */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Måloppnåelse</h3>
          <div className="space-y-2">
            <p>Oppnådde mål: {data.goals.achieved} av {data.goals.total}</p>
            {data.goals.nextYearGoals.length > 0 && (
              <>
                <p className="font-medium mt-4">Mål for neste år:</p>
                <ul className="list-disc pl-4">
                  {data.goals.nextYearGoals.map((goal, i) => (
                    <li key={i}>{goal}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
} 