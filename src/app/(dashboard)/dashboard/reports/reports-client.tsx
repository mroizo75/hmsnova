"use client"

import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { KPIOverview } from "./kpi-overview"
import { DeviationReport } from "./deviation-report"
import { RiskReport } from "./risk-report"
import { CustomReport } from "./custom-report"
import { InternalAuditReport } from "./internal-audit-report"
import { ExportDialog } from "./export-dialog"
import { useState } from "react"
import { InternalAuditData } from "./internal-audit-report"

export interface StatsItem {
  companyId: string
  status: string
  _count: {
    _all: number
  }
}

interface Props {
  stats: [StatsItem[], StatsItem[], any[]]  // [deviations, riskAssessments, monthlyStats]
  auditData: InternalAuditData | null  // Endre til å tillate null
}

export function ReportsClient({ stats, auditData }: Props) {
  const [deviationStats, riskAssessmentStats, monthlyStats] = stats
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Rapporter og Analyse</h1>
        <ExportDialog />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Oversikt</TabsTrigger>
          <TabsTrigger value="deviations">Avvik</TabsTrigger>
          <TabsTrigger value="risks">Risikovurderinger</TabsTrigger>
          <TabsTrigger value="custom">Tilpasset Rapport</TabsTrigger>
          <TabsTrigger value="audit">HMS Årsrapport</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <KPIOverview stats={stats} />
        </TabsContent>

        <TabsContent value="deviations">
          <DeviationReport stats={deviationStats as StatsItem[]} />
        </TabsContent>

        <TabsContent value="risks">
          <RiskReport stats={riskAssessmentStats as StatsItem[]} />
        </TabsContent>

        <TabsContent value="custom">
          <CustomReport companyId={deviationStats[0].companyId} />
        </TabsContent>

        <TabsContent value="audit">
          {auditData ? (
            <InternalAuditReport data={auditData} />
          ) : (
            <Card className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-medium">Kunne ikke laste internrevisjonsdata</h3>
                <p className="text-muted-foreground mt-2">
                  Prøv å laste siden på nytt eller kontakt support hvis problemet vedvarer.
                </p>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 