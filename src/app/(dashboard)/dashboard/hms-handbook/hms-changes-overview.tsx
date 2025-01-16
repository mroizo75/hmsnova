"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { SelectSectionDialog } from "./select-section-dialog"

interface HMSChange {
  id: string
  title: string
  description: string
  changeType: string
  status: string
  deviations: {
    deviation: {
      id: string
      title: string
      description: string
    }
  }[]
  riskAssessments: {
    riskAssessment: {
      id: string
      title: string
      description: string
    }
  }[]
  measures: {
    id: string
    description: string
    type: string
    status: string
  }[]
}

export function HMSChangesOverview() {
  const [changes, setChanges] = useState<HMSChange[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedChangeId, setSelectedChangeId] = useState<string>("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    const fetchChanges = async () => {
      try {
        const response = await fetch('/api/hms/changes/pending')
        if (!response.ok) throw new Error('Kunne ikke hente HMS-endringer')
        const data = await response.json()
        console.log("Fetched pending changes:", data)
        setChanges(data)
      } catch (error) {
        console.error("Error fetching changes:", error)
        toast.error('Kunne ikke hente HMS-endringer')
      } finally {
        setIsLoading(false)
      }
    }

    fetchChanges()
  }, [])

  const handleSectionSelected = () => {
    // Oppdater listen etter at en endring er tilknyttet en seksjon
    const fetchChanges = async () => {
      try {
        const response = await fetch('/api/hms/changes/pending')
        if (!response.ok) throw new Error('Kunne ikke hente HMS-endringer')
        const data = await response.json()
        setChanges(data)
      } catch (error) {
        console.error("Error fetching changes:", error)
        toast.error('Kunne ikke oppdatere HMS-endringer')
      }
    }
    fetchChanges()
  }

  if (isLoading) {
    return <div>Laster HMS-endringer...</div>
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Ventende HMS-endringer</h2>
      
      {changes.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Ingen ventende HMS-endringer
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {changes.map(change => (
            <Card key={change.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <CardTitle className="text-base">
                  {change.title}
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedChangeId(change.id)
                    setIsDialogOpen(true)
                  }}
                >
                  Tilknytt til seksjon
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {change.description}
                  </p>

                  {/* Vis tilknyttede avvik */}
                  {change.deviations?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mt-2">Tilknyttede avvik:</p>
                      <ul className="list-disc list-inside text-sm">
                        {change.deviations
                          .filter(d => d?.deviation)
                          .map(d => (
                            <li key={d.deviation.id}>
                              {d.deviation.title}
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}

                  {/* Vis tilknyttede risikovurderinger */}
                  {change.riskAssessments?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mt-2">Tilknyttede risikovurderinger:</p>
                      <ul className="list-disc list-inside text-sm">
                        {change.riskAssessments
                          .filter(r => r?.riskAssessment)
                          .map(r => (
                            <li key={r.riskAssessment.id}>
                              {r.riskAssessment.title}
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}

                  {/* Vis tilknyttede tiltak */}
                  {change.measures?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mt-2">Tiltak:</p>
                      <ul className="list-disc list-inside text-sm">
                        {change.measures.map(measure => (
                          <li key={measure.id}>
                            {measure.description}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <SelectSectionDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        changeId={selectedChangeId}
        onSectionSelected={handleSectionSelected}
      />
    </div>
  )
} 