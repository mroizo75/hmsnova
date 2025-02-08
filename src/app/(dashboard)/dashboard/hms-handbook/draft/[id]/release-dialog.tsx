"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PendingChanges } from "./pending-changes"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Diff } from '@/components/diff'
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface Props {
  handbookId: string
  currentVersion: number
}

export function ReleaseDialog({ handbookId, currentVersion }: Props) {
  const [open, setOpen] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [changes, setChanges] = useState<any[]>([])
  const [changeComment, setChangeComment] = useState("")
  const [reason, setReason] = useState("")
  const router = useRouter()

  async function handlePublish() {
    if (!changeComment.trim() || !reason.trim()) {
      toast.error("Vennligst fyll ut endringsbeskrivelse og årsak")
      return
    }

    try {
      setIsPublishing(true)

      const response = await fetch(`/api/hms-handbook/${handbookId}/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          version: currentVersion + 1,
          changes: changeComment,
          reason: reason,
        }),
      })

      if (!response.ok) {
        throw new Error("Kunne ikke publisere håndboken")
      }

      toast.success("HMS-håndbok publisert")
      router.refresh()
      setOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Noe gikk galt")
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Publiser endringer</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Publiser HMS-håndbok</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Endringer siden forrige versjon */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Endringer siden forrige versjon</h3>
            {changes.map((change, i) => (
              <div key={i} className="mb-4">
                <h4 className="text-sm font-medium">
                  {change.title}
                  <span className="ml-2 text-muted-foreground">
                    ({change.type === 'ADD' ? 'Ny' : 
                      change.type === 'DELETE' ? 'Slettet' : 'Endret'})
                  </span>
                </h4>
                
                {change.type === 'MODIFY' && (
                  <Diff 
                    oldText={change.oldContent}
                    newText={change.newContent}
                    title={`Endringer i ${change.title}`}
                    showLineNumbers={true}
                    maxHeight="200px"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Endringsbeskrivelse */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="changes">Beskrivelse av endringer</Label>
              <Textarea
                id="changes"
                placeholder="Beskriv endringene som er gjort..."
                value={changeComment}
                onChange={(e) => setChangeComment(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Årsak til endring</Label>
              <Textarea
                id="reason"
                placeholder="Beskriv årsaken til endringene..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          
          <PendingChanges handbookId={handbookId} />
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Avbryt
            </Button>
            <Button 
              onClick={handlePublish}
              disabled={isPublishing || !changeComment.trim() || !reason.trim()}
            >
              {isPublishing ? "Publiserer..." : "Publiser"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 