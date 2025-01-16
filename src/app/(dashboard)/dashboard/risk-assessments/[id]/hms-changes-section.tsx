"use client"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { HMSChanges } from "@/components/hms/hms-changes"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { LinkHMSChangeModal } from "@/components/risk-assessment/link-hms-change-modal"
import { RiskAssessment } from "@prisma/client"

interface Props {
  riskAssessment: RiskAssessment & {
    hmsChanges?: Array<{
      hmsChange: {
        id: string
        title: string
        description: string
        status: string
        implementedAt: Date | null
      }
    }>
  }
}

export function HMSChangesSection({ riskAssessment }: Props) {
  const [showDialog, setShowDialog] = useState(false)
  const [showLinkModal, setShowLinkModal] = useState(false)

  const changes = riskAssessment.hmsChanges?.map(change => change.hmsChange) || []

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>HMS-endringer</CardTitle>
            <CardDescription>
              Endringer i HMS-systemet basert på denne risikovurderingen
            </CardDescription>
          </div>
          <Button onClick={() => setShowDialog(true)}>
            Registrer HMS-endring
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {changes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Ingen HMS-endringer registrert ennå
            </p>
          ) : (
            changes.map(change => (
              <div key={change.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{change.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {change.description}
                  </p>
                </div>
                <Badge variant={change.implementedAt ? "success" : "secondary"}>
                  {change.implementedAt ? "Implementert" : "Ikke implementert"}
                </Badge>
              </div>
            ))
          )}
        </div>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Registrer HMS-endring</DialogTitle>
            </DialogHeader>
            <HMSChanges 
              sectionId={riskAssessment.department || 'general'}
              riskAssessmentId={riskAssessment.id}
              mode="create"
            />
          </DialogContent>
        </Dialog>

        <LinkHMSChangeModal
          isOpen={showLinkModal}
          onClose={() => setShowLinkModal(false)}
          riskAssessmentId={riskAssessment.id}
          hazards={riskAssessment.hazards}
          changes={riskAssessment.hmsChanges.map(c => c.hmsChange)}
        />
      </CardContent>
    </Card>
  )
} 