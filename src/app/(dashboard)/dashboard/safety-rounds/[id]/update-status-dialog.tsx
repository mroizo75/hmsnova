"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { status: string; comment?: string }) => Promise<void>
  currentStatus: string
}

export function UpdateStatusDialog({ 
  open, 
  onOpenChange, 
  onSubmit,
  currentStatus 
}: Props) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(currentStatus)
  const [comment, setComment] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      await onSubmit({ status, comment })
      onOpenChange(false)
      setComment("")
    } catch (error) {
      toast.error('Kunne ikke oppdatere status')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Oppdater status</DialogTitle>
          <DialogDescription>
            Velg ny status for vernerunden
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={setStatus}
            >
              <SelectTrigger>
                <SelectValue placeholder="Velg status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Kladd</SelectItem>
                <SelectItem value="IN_PROGRESS">Under arbeid</SelectItem>
                <SelectItem value="COMPLETED">Fullført</SelectItem>
                <SelectItem value="CANCELLED">Kansellert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Kommentar (valgfri)</Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Legg til en kommentar om statusendringen"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Avbryt
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Oppdaterer..." : "Oppdater status"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 