"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface Props {
  onSuccess?: () => void
}

export function AddGoalDialog({ onSuccess }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [description, setDescription] = useState("")
  const [year, setYear] = useState(new Date().getFullYear())

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      setLoading(true)
      const response = await fetch('/api/hms-goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, year })
      })
      
      if (!response.ok) throw new Error('Kunne ikke opprette mål')
      
      toast.success('HMS-mål opprettet')
      setOpen(false)
      setDescription("")
      onSuccess?.()
    } catch (error) {
      toast.error('Kunne ikke opprette mål')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>Legg til HMS-mål</Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Legg til nytt HMS-mål</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Beskrivelse</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="year">År</Label>
            <Input
              id="year"
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              required
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Lagrer..." : "Lagre"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
} 