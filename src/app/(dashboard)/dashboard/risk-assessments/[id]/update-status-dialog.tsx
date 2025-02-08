"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react"
import { toast } from "sonner"

interface Props {
  assessment: {
    id: string
    status: string
  }
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: () => Promise<void>
}

export function UpdateStatusDialog({ assessment, open, onOpenChange, onUpdate }: Props) {
  const [status, setStatus] = useState(assessment.status)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleSubmit = async () => {
    try {
      setIsUpdating(true)
      const response = await fetch(`/api/risk-assessments/${assessment.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (!response.ok) throw new Error('Kunne ikke oppdatere status')

      await onUpdate()
      onOpenChange(false)
      toast.success('Status oppdatert')
    } catch (error) {
      console.error('Feil ved statusoppdatering:', error)
      toast.error('Kunne ikke oppdatere status')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Badge variant="outline" className="mr-2">
            {assessment.status}
          </Badge>
          Endre status
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Endre status</DialogTitle>
          <DialogDescription>
            Velg ny status for risikovurderingen
          </DialogDescription>
        </DialogHeader>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Velg status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DRAFT">Utkast</SelectItem>
            <SelectItem value="OPEN">Åpen</SelectItem>
            <SelectItem value="IN_PROGRESS">Under arbeid</SelectItem>
            <SelectItem value="SCHEDULED">Planlagt</SelectItem>
            <SelectItem value="CLOSED">Lukket</SelectItem>
            <SelectItem value="CANCELLED">Kansellert</SelectItem>
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Avbryt
          </Button>
          <Button onClick={handleSubmit} disabled={isUpdating}>
            {isUpdating ? "Oppdaterer..." : "Oppdater status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 