"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Change {
  id: string
  title: string
  description: string
  status: string
}

interface Props {
  sectionId: string
}

export function SelectHMSChangesDialog({ sectionId }: Props) {
  const [open, setOpen] = useState(false)
  const [changes, setChanges] = useState<Change[]>([])
  const [selectedChanges, setSelectedChanges] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  async function loadChanges() {
    try {
      const response = await fetch("/api/hms-changes")
      if (!response.ok) throw new Error("Kunne ikke hente endringer")
      const data = await response.json()
      setChanges(data)
    } catch (error) {
      console.error("Error loading changes:", error)
      toast.error("Kunne ikke hente HMS-endringer")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSave() {
    try {
      setIsSaving(true)
      const response = await fetch(`/api/hms-handbook/sections/${sectionId}/changes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ changeIds: selectedChanges }),
      })

      if (!response.ok) throw new Error("Kunne ikke lagre endringer")

      toast.success("Endringer lagret")
      router.refresh()
      setOpen(false)
    } catch (error) {
      toast.error("Kunne ikke lagre endringer")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => {
          setIsLoading(true)
          loadChanges()
        }}>
          Legg til HMS-endringer
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Velg HMS-endringer</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div>Laster endringer...</div>
        ) : (
          <div className="space-y-4">
            {changes.map((change) => (
              <div key={change.id} className="flex items-start space-x-3">
                <Checkbox
                  id={change.id}
                  checked={selectedChanges.includes(change.id)}
                  onCheckedChange={(checked) => {
                    setSelectedChanges(prev => 
                      checked 
                        ? [...prev, change.id]
                        : prev.filter(id => id !== change.id)
                    )
                  }}
                />
                <div className="space-y-1">
                  <label 
                    htmlFor={change.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {change.title}
                  </label>
                  <p className="text-sm text-muted-foreground">
                    {change.description}
                  </p>
                </div>
              </div>
            ))}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Avbryt
              </Button>
              <Button 
                onClick={handleSave}
                disabled={selectedChanges.length === 0 || isSaving}
              >
                {isSaving ? "Lagrer..." : "Lagre"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 