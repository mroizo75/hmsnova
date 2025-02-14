"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface PendingChange {
  id: string
  title: string
  description: string
  changeType: string
  status: string
  createdAt: string
  deviations?: {
    deviation: {
      id: string
      title: string
      measures?: {
        id: string
        description: string
        type: string
        status: string
      }[]
    }
  }[]
  riskAssessments?: {
    riskAssessment: {
      id: string
      title: string
      measures?: {
        id: string
        description: string
        type: string
        status: string
      }[]
    }
  }[]
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  sectionId: string
  onChangesSelected: () => void
}

export function PendingChangesDialog({ open, onOpenChange, sectionId, onChangesSelected }: Props) {
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([])
  const [selectedChanges, setSelectedChanges] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchPendingChanges = async () => {
      if (!open) return
      
      try {
        setIsLoading(true)
        const response = await fetch('/api/hms/changes/pending')
        if (!response.ok) throw new Error('Kunne ikke hente endringer')
        const data = await response.json()
        setPendingChanges(data)
      } catch (error) {
        toast.error('Kunne ikke hente HMS-endringer')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPendingChanges()
  }, [open])

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/hms/sections/${sectionId}/changes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          changeIds: selectedChanges
        })
      })

      if (!response.ok) throw new Error('Kunne ikke legge til endringer')

      toast.success('HMS-endringer lagt til i seksjonen')
      onChangesSelected()
      onOpenChange(false)
      setSelectedChanges([])
    } catch (error) {
      toast.error('Kunne ikke legge til HMS-endringer')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Ventende HMS-endringer</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div>Laster endringer...</div>
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {pendingChanges.length > 0 ? (
              pendingChanges.map(change => (
                <Card 
                  key={change.id}
                  className={`cursor-pointer transition-colors ${
                    selectedChanges.includes(change.id) ? 'border-primary' : ''
                  }`}
                  onClick={() => {
                    setSelectedChanges(prev => 
                      prev.includes(change.id) 
                        ? prev.filter(id => id !== change.id)
                        : [...prev, change.id]
                    )
                  }}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{change.title}</CardTitle>
                      <Badge>{change.changeType}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{change.description}</p>
                    
                    {change.deviations?.map(({ deviation }) => (
                      <div key={deviation.id} className="space-y-2">
                        <div className="text-sm font-medium">
                          Fra avvik: {deviation.title}
                        </div>
                        {deviation.measures?.map(measure => (
                          <div key={measure.id} className="ml-4 text-sm">
                            • {measure.description}
                            <Badge className="ml-2" variant="outline">
                              {measure.type}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ))}

                    {change.riskAssessments?.map(({ riskAssessment }) => (
                      <div key={riskAssessment.id} className="space-y-2">
                        <div className="text-sm font-medium">
                          Fra risikovurdering: {riskAssessment.title}
                        </div>
                        {riskAssessment.measures?.map(measure => (
                          <div key={measure.id} className="ml-4 text-sm">
                            • {measure.description}
                            <Badge className="ml-2" variant="outline">
                              {measure.type}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">
                Ingen ventende HMS-endringer funnet
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            onClick={handleSave}
            disabled={selectedChanges.length === 0}
          >
            Legg til valgte endringer i seksjonen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 