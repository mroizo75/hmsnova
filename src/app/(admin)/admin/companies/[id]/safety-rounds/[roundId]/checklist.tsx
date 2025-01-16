"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/ui/image-upload" // Du må lage denne komponenten
import { useState } from "react"
import { toast } from "sonner"

interface ChecklistItem {
  id: string
  category: string
  question: string
  description?: string
  response?: string
  comment?: string
  imageUrl?: string
  isRequired: boolean
  completedAt?: string
  completedBy?: string
}

interface ChecklistProps {
  roundId: string
  items: ChecklistItem[]
  onUpdate: (items: ChecklistItem[]) => void
  isEditable: boolean
}

export function Checklist({ roundId, items, onUpdate, isEditable }: ChecklistProps) {
  const [loading, setLoading] = useState(false)

  const handleResponseChange = async (itemId: string, value: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/companies/${companyId}/safety-rounds/${roundId}/checklist/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: value })
      })

      if (!response.ok) throw new Error('Kunne ikke oppdatere svar')

      const updatedItem = await response.json()
      const newItems = items.map(item => 
        item.id === itemId ? updatedItem : item
      )
      onUpdate(newItems)
      toast.success('Svar lagret')
    } catch (error) {
      toast.error('Kunne ikke lagre svar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {items.map((item) => (
        <Card key={item.id}>
          <CardHeader>
            <CardTitle className="text-lg">{item.question}</CardTitle>
            {item.description && (
              <CardDescription>{item.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              disabled={!isEditable || loading}
              value={item.response}
              onValueChange={(value) => handleResponseChange(item.id, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Velg svar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="YES">Ja</SelectItem>
                <SelectItem value="NO">Nei</SelectItem>
                <SelectItem value="NA">Ikke relevant</SelectItem>
              </SelectContent>
            </Select>

            <Textarea
              placeholder="Legg til kommentar"
              value={item.comment || ""}
              onChange={(e) => {
                // Implementer kommentar-oppdatering
              }}
              disabled={!isEditable || loading}
            />

            {/* Implementer bildeopplasting her */}
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 