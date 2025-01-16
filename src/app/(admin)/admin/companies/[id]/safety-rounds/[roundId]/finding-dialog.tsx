"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "react-hot-toast"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    description: string
    severity: string
    checklistItemId: string
  }) => Promise<void>
  checklistItemId: string
}

export function FindingDialog({ open, onOpenChange, onSubmit, checklistItemId }: Props) {
  const [loading, setLoading] = useState(false)
  const [description, setDescription] = useState("")
  const [severity, setSeverity] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)

      // Valider at vi har all nødvendig data
      if (!description || !severity || !checklistItemId) {
        toast.error('Vennligst fyll ut alle påkrevde felt')
        return
      }

      const findingData = {
        description,
        severity,
        checklistItemId
      }

      console.log('Submitting finding data:', findingData)

      await onSubmit(findingData)
      
      // Reset form
      setDescription("")
      setSeverity("")
      onOpenChange(false)
    } catch (error) {
      console.error('Error in handleSubmit:', error)
      toast.error(error instanceof Error ? error.message : 'Kunne ikke registrere funn')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrer funn</DialogTitle>
          <DialogDescription>
            Beskriv avviket og velg alvorlighetsgrad
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Beskrivelse av funn</Label>
            <Textarea
              placeholder="Beskriv hva som er feil og eventuelle konsekvenser"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Alvorlighetsgrad</Label>
            <Select value={severity} onValueChange={setSeverity} required>
              <SelectTrigger>
                <SelectValue placeholder="Velg alvorlighetsgrad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Lav</SelectItem>
                <SelectItem value="MEDIUM">Middels</SelectItem>
                <SelectItem value="HIGH">Høy</SelectItem>
                <SelectItem value="CRITICAL">Kritisk</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Avbryt
            </Button>
            <Button type="submit" disabled={loading || !description || !severity}>
              {loading ? "Lagrer..." : "Registrer funn"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 