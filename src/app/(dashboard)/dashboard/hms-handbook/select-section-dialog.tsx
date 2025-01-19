"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import type { Section } from "./hms-handbook-client"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  changeId: string
  onSectionSelected: (sectionId: string) => void
}

export function SelectSectionDialog({ open, onOpenChange, changeId }: Props) {
  const [sections, setSections] = useState<Section[]>([])
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
        console.error('Error:', error)
        toast.error('Kunne ikke hente seksjoner')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSections()
  }, [open])

  const handleSelectSection = async (sectionId: string) => {
    try {
      const response = await fetch(`/api/hms/sections/${sectionId}/changes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changeIds: [changeId] })
      })

      if (!response.ok) throw new Error('Kunne ikke legge til endring')
      
      toast.success('Endring lagt til i seksjonen')
      onOpenChange(false)
    } catch (error) {
      toast.error('Kunne ikke legge til endring i seksjonen')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <h2 className="text-lg font-semibold">Velg seksjon</h2>
        </DialogHeader>
        
        {isLoading ? (
          <div>Laster seksjoner...</div>
        ) : (
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {sections.map(section => (
              <Card
                key={section.id}
                className="p-4 cursor-pointer hover:bg-muted"
                onClick={() => handleSelectSection(section.id)}
              >
                <h3 className="font-medium">{section.title}</h3>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 