"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from "react"
import { Upload } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Props {
  deviationId: string
}

export function ImageUpload({ deviationId }: Props) {
  const [open, setOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [caption, setCaption] = useState("")
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return

    try {
      setIsUploading(true)
      const formData = new FormData()
      formData.append("file", file)
      formData.append("caption", caption)

      const response = await fetch(`/api/deviations/${deviationId}/images`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Kunne ikke laste opp bilde")
      }

      toast.success("Bilde lastet opp")
      setOpen(false)
      setFile(null)
      setCaption("")
      router.refresh()
    } catch (error) {
      toast.error("Kunne ikke laste opp bilde")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Last opp bilde
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Last opp bilde</DialogTitle>
          <DialogDescription>
            Velg et bilde og legg til en beskrivende tekst.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="file">Bilde</Label>
            <Input
              id="file"
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
            />
          </div>
          <div>
            <Label htmlFor="caption">Beskrivelse</Label>
            <Input
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Beskriv bildet..."
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isUploading || !file}>
              {isUploading ? "Laster opp..." : "Last opp"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 