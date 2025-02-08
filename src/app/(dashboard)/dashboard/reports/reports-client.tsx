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
  stats: [StatsItem[], StatsItem[], any[]]
  auditData: InternalAuditData
  trends: {
    date: string
    maxRiskLevel: number
    assessmentCount: number
    highRiskCount: number
  }[]
}

export function ReportsClient({ stats, auditData, trends }: Props) {
  const [deviationStats, riskAssessmentStats, monthlyStats] = stats
  const [activeTab, setActiveTab] = useState("overview")

  // Håndter tomme data
  const hasDeviations = deviationStats && deviationStats.length > 0
  const companyId = hasDeviations ? deviationStats[0].companyId : auditData.deviations.companyId

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
          <DeviationReport stats={deviationStats} />
        </TabsContent>

        <TabsContent value="risks">
          <RiskReport stats={riskAssessmentStats} trends={trends} />
        </TabsContent>

        <TabsContent value="custom">
          <CustomReport companyId={companyId} />
        </TabsContent>

        <TabsContent value="audit">
          <InternalAuditReport data={auditData} />
        </TabsContent>
      </Tabs>
    </div>
  )
} 