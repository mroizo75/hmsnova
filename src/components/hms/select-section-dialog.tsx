"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"

interface Section {
  id: string
  title: string
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  changeId: string
  onSectionSelected?: () => void
}

export function SelectSectionDialog({ open, onOpenChange, changeId, onSectionSelected }: Props) {
  const [sections, setSections] = useState<Section[]>([])
  const [selectedSectionId, setSelectedSectionId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchSections = async () => {
      if (!open) return
      
      try {
        setIsLoading(true)
        const response = await fetch('/api/hms/sections')
        if (!response.ok) throw new Error('Kunne ikke hente seksjoner')
        const data = await response.json()
        setSections(data)
      } catch (error) {
        console.error("Error fetching sections:", error)
        toast.error('Kunne ikke hente seksjoner')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSections()
  }, [open])

  const handleSubmit = async () => {
    if (!selectedSectionId) return

    try {
      const response = await fetch(`/api/hms/sections/${selectedSectionId}/changes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changeIds: [changeId] })
      })

      if (!response.ok) throw new Error('Kunne ikke legge til endring i seksjonen')
      
      toast.success('Endring lagt til i seksjonen')
      onOpenChange(false)
      setSelectedSectionId("")
      onSectionSelected?.()
    } catch (error) {
      toast.error('Kunne ikke legge til endring i seksjonen')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Velg seksjon for HMS-endringen</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div>Laster seksjoner...</div>
        ) : sections.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            Ingen seksjoner funnet
          </div>
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {sections.map(section => (
              <Card
                key={section.id}
                className={`cursor-pointer transition-colors ${
                  selectedSectionId === section.id ? 'border-primary' : ''
                }`}
                onClick={() => setSelectedSectionId(section.id)}
              >
                <CardContent className="p-4">
                  <h3 className="font-medium">{section.title}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={!selectedSectionId}
          >
            Legg til i seksjon
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 