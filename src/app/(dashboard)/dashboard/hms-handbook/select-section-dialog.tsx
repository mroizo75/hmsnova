"use client"

import { useState, useEffect } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import type { Section } from "./hms-handbook-client"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  changeId: string
  onSectionSelected: (sectionId: string) => void
}

interface HMSChange {
  id: string
  title: string
  description: string
  changeType: string
  status: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  dueDate?: Date
  implementedAt?: Date
  createdBy: string
  assignedTo?: string
  companyId: string
}

export function SelectSectionDialog({ open, onOpenChange, changeId, onSectionSelected }: Props) {
  const [sections, setSections] = useState<Section[]>([])
  const [change, setChange] = useState<HMSChange | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Debug logging for props
  console.log('SelectSectionDialog props:', { open, changeId })

  useEffect(() => {
    const fetchData = async () => {
      if (!open) return
      try {
        setIsLoading(true)
        const sectionsResponse = await fetch('/api/hms/sections')
        if (!sectionsResponse.ok) throw new Error('Kunne ikke hente seksjoner')
        const sectionsData = await sectionsResponse.json()
        setSections(sectionsData)

        // Debug logging for change fetch
        console.log('Fetching change with id:', changeId)
        const changeResponse = await fetch(`/api/hms/changes/${changeId}`)
        if (!changeResponse.ok) throw new Error('Kunne ikke hente endring')
        const changeData = await changeResponse.json()
        console.log('Fetched change data:', changeData)
        setChange(changeData)
      } catch (error) {
        console.error('Error:', error)
        toast.error('Kunne ikke hente data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [open, changeId])

  const handleSelectSection = async (sectionId: string) => {
    try {
      // Debug logging for request
      console.log('handleSelectSection called with:', { sectionId, changeId })
      
      const requestData = {
        changeId
      }
      console.log('Preparing request with data:', requestData)

      const response = await fetch(`/api/hms/sections/${sectionId}/changes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })

      // Debug logging for response
      console.log('Response status:', response.status)
      const responseData = await response.json()
      console.log('Response data:', responseData)

      if (!response.ok) {
        throw new Error(responseData.message || 'Kunne ikke legge til endring i seksjonen')
      }
      
      toast.success('Endring lagt til i seksjonen')
      onSectionSelected(sectionId)
      onOpenChange(false)
    } catch (error) {
      console.error('Error in handleSelectSection:', error)
      toast.error('Kunne ikke legge til endring i seksjonen')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Velg seksjon for HMS-endring</DialogTitle>
          <DialogDescription>
            Velg hvilken seksjon i HMS-håndboken denne endringen skal knyttes til
          </DialogDescription>
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