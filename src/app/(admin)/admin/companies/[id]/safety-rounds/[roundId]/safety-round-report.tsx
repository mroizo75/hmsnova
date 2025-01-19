"use client"

import { Card } from "@/components/ui/card"
import { formatDate } from "@/lib/utils/date"
import { FindingsList } from "./findings-list"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { ExtendedSafetyRound } from "../types"

interface SafetyRoundReportProps {
  safetyRound: ExtendedSafetyRound
  onDownload: () => Promise<void>
  isLoading: boolean
}

export function SafetyRoundReport({ safetyRound, onDownload, isLoading }: SafetyRoundReportProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Rapport fra vernerunde</h2>
        {onDownload && (
          <Button 
            onClick={onDownload}
            disabled={isLoading}
          >
            <Download className="w-4 h-4 mr-2" />
            Last ned rapport
          </Button>
        )}
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">Detaljer</h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-muted-foreground">Tittel</dt>
                <dd>{safetyRound.title}</dd>
              </div>
              {safetyRound.description && (
                <div>
                  <dt className="text-sm text-muted-foreground">Beskrivelse</dt>
                  <dd>{safetyRound.description}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm text-muted-foreground">Gjennomført av</dt>
                <dd>{safetyRound.assignedUser?.name || 'Ikke tildelt'}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Fullført dato</dt>
                <dd>{safetyRound.completedAt ? formatDate(safetyRound.completedAt) : 'Ikke fullført'}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="font-medium mb-2">Statistikk</h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-muted-foreground">Antall sjekkpunkter</dt>
                <dd>{safetyRound.checklistItems.length}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Antall funn</dt>
                <dd>{safetyRound.findings.length}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Åpne funn</dt>
                <dd>{safetyRound.findings.filter(f => f.status === 'OPEN').length}</dd>
              </div>
            </dl>
          </div>
        </div>
      </Card>

      <div>
        <h3 className="text-xl font-semibold mb-4">Registrerte funn</h3>
        <FindingsList findings={safetyRound.findings} />
      </div>
    </div>
  )
} 