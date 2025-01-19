"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { HMSChanges } from "@/components/hms/hms-changes"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RiskAssessment } from "@prisma/client"

type RiskAssessmentWithRelations = RiskAssessment & {
  relatedHMSSections?: Array<{
    id: string
    title: string
  }>
}

export function RiskAssessmentDetails({ riskAssessment }: { riskAssessment: RiskAssessmentWithRelations }) {
  const [showHMSDialog, setShowHMSDialog] = useState(false)
  const [canFinalize, setCanFinalize] = useState(false)

  useEffect(() => {
    const checkHMSChanges = async () => {
      const response = await fetch(`/api/risk-assessments/${riskAssessment.id}/hms-changes`)
      const data = await response.json()
      setCanFinalize(data.length > 0)
    }
    checkHMSChanges()
  }, [riskAssessment.id])

  const handleFinalize = async () => {
    try {
      const response = await fetch(`/api/risk-assessments/${riskAssessment.id}/finalize`, {
        method: 'POST'
      })
      if (!response.ok) throw new Error('Kunne ikke fullføre risikovurderingen')
      // Håndter vellykket fullføring (f.eks. redirect eller oppdater UI)
    } catch (error) {
      console.error('Error finalizing risk assessment:', error)
      // Vis feilmelding til bruker
    }
  }

  return (
    <div className="space-y-6">
      {/* Eksisterende risikovurderingsinnhold ... */}

      {/* Kobling til HMS-system */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>HMS-tiltak</CardTitle>
              <CardDescription>
                Endringer i HMS-systemet basert på denne risikovurderingen
              </CardDescription>
            </div>
            <Button onClick={() => setShowHMSDialog(true)}>
              Registrer HMS-endring
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Vis eksisterende tiltak */}
            <HMSChanges 
              sectionId={riskAssessment.department || 'general'}
              riskAssessmentId={riskAssessment.id}
            />

            {/* Vis kobling til relevante HMS-seksjoner */}
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Relevante HMS-seksjoner</h4>
              <div className="text-sm text-muted-foreground">
                {riskAssessment.relatedHMSSections?.map(section => (
                  <a 
                    key={section.id}
                    href={`/dashboard/hms-handbook/${section.id}`}
                    className="block hover:underline"
                  >
                    {section.title}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog for å registrere HMS-endring */}
      <Dialog open={showHMSDialog} onOpenChange={setShowHMSDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrer HMS-endring</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Basert på denne risikovurderingen, hvilke endringer bør gjøres i HMS-systemet?
            </p>
            <HMSChanges 
              sectionId={riskAssessment.department || 'general'}
              riskAssessmentId={riskAssessment.id}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>HMS-endringer</CardTitle>
          <CardDescription>
            Nødvendige endringer i HMS-systemet basert på denne risikovurderingen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HMSChanges 
            sectionId={riskAssessment.department || 'general'}
            riskAssessmentId={riskAssessment.id}
          />
        </CardContent>
      </Card>

      <Button 
        onClick={handleFinalize} 
        disabled={!canFinalize}
      >
        Fullfør risikovurdering
      </Button>
    </div>
  )
} 