"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  sectionId: string
}

interface HMSChange {
  id: string
  title: string
  description: string
  status: string
  deviations: Array<{
    deviation: {
      id: string
      title: string
    }
  }>
}

export function SelectHMSChangesDialog({ open, onOpenChange, sectionId }: Props) {
  const [changes, setChanges] = useState<HMSChange[]>([])
  const [selectedChanges, setSelectedChanges] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchChanges = async () => {
      if (!open) return
      
      try {
        setIsLoading(true)
        const response = await fetch('/api/hms/changes/pending')
        if (!response.ok) throw new Error('Kunne ikke hente endringer')
        const data = await response.json()
        setChanges(data)
      } catch (error) {
        console.error("Error fetching changes:", error)
        toast.error('Kunne ikke hente endringer')
      } finally {
        setIsLoading(false)
      }
    }

    if (open) {
      fetchChanges()
      setSelectedChanges([])
    }
  }, [open])

  const handleSubmit = async () => {
    try {
      const response = await fetch(`/api/hms/sections/${sectionId}/changes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changeIds: selectedChanges })
      })

      if (!response.ok) throw new Error('Kunne ikke legge til endringer')
      
      toast.success('Endringer lagt til i seksjonen')
      onOpenChange(false)
    } catch (error) {
      toast.error('Kunne ikke legge til endringer')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Velg HMS-endringer å legge til</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div>Laster endringer...</div>
        ) : changes.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            Ingen ventende HMS-endringer
          </div>
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {changes.map(change => (
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
                <CardContent className="p-4">
                  <h3 className="font-medium">{change.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {change.description}
                  </p>
                  
                  {change.deviations?.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Fra avvik:</p>
                      <ul className="list-disc list-inside text-sm">
                        {change.deviations.map(d => (
                          <li key={d.deviation.id}>{d.deviation.title}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={selectedChanges.length === 0}
          >
            Legg til endringer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 