"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { toast } from "sonner"

interface PendingChange {
  id: string
  title: string
  description: string
  changeType: string
  source: {
    type: 'RISK_ASSESSMENT' | 'DEVIATION' | 'HAZARD'
    id: string
    title: string
  }
  sections: Array<{
    id: string
    title: string
  }>
}

export function PendingChanges() {
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([])
  const [implementing, setImplementing] = useState<string[]>([])

  const implementChange = async (changeId: string) => {
    try {
      setImplementing(prev => [...prev, changeId])
      const response = await fetch(`/api/hms/changes/${changeId}/implement`, {
        method: 'POST'
      })

      if (!response.ok) throw new Error('Kunne ikke implementere endring')

      setPendingChanges(prev => prev.filter(change => change.id !== changeId))
      toast.success('HMS-endring implementert')
    } catch (error) {
      toast.error('Kunne ikke implementere endring')
    } finally {
      setImplementing(prev => prev.filter(id => id !== changeId))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ventende HMS-endringer</CardTitle>
        <CardDescription>
          Endringer som venter på implementering i HMS-håndboken
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pendingChanges.map(change => (
            <div key={change.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{change.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {change.description}
                  </p>
                  <div className="mt-2 text-sm">
                    <span className="font-medium">Kilde: </span>
                    {change.source.type === 'RISK_ASSESSMENT' && 'Risikovurdering: '}
                    {change.source.type === 'DEVIATION' && 'Avvik: '}
                    {change.source.type === 'HAZARD' && 'Fare: '}
                    {change.source.title}
                  </div>
                  <div className="mt-2">
                    <span className="text-sm font-medium">Berørte seksjoner: </span>
                    <div className="flex gap-2 mt-1">
                      {change.sections.map(section => (
                        <span 
                          key={section.id}
                          className="text-xs bg-muted px-2 py-1 rounded"
                        >
                          {section.title}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  disabled={implementing.includes(change.id)}
                  onClick={() => implementChange(change.id)}
                >
                  {implementing.includes(change.id) 
                    ? "Implementerer..." 
                    : "Implementer"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 