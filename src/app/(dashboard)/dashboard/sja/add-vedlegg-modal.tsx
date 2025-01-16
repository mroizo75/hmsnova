"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { toast } from "sonner"

interface AddVedleggModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sjaId: string
}

export function AddVedleggModal({ open, onOpenChange, sjaId }: AddVedleggModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [caption, setCaption] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      toast.error("Velg en fil")
      return
    }

    setIsLoading(true)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("caption", caption)

    try {
      const response = await fetch(`/api/sja/${sjaId}/vedlegg`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Kunne ikke laste opp vedlegg")

      toast.success("Vedlegg lastet opp")
      onOpenChange(false)
      // Refresh siden for å vise nytt vedlegg
      window.location.reload()
    } catch (error) {
      console.error("Error:", error)
      toast.error("Kunne ikke laste opp vedlegg")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Last opp vedlegg</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Fil</Label>
            <Input
              id="file"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="caption">Beskrivelse</Label>
            <Input
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Skriv en kort beskrivelse av vedlegget..."
              disabled={isLoading}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Avbryt
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Laster opp..." : "Last opp"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 