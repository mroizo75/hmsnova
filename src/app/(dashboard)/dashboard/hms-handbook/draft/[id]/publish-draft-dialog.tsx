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
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface PublishDraftDialogProps {
  draftId: string
}

export function PublishDraftDialog({ draftId }: PublishDraftDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const router = useRouter()

  async function publishDraft() {
    try {
      setIsPublishing(true)
      const response = await fetch(`/api/hms-handbook/${draftId}/publish`, {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Kunne ikke publisere kladden')
      }

      toast.success('HMS-håndboken er nå publisert')
      setOpen(false)
      router.push('/dashboard/hms-handbook')
    } catch (error) {
      toast.error('Kunne ikke publisere kladden')
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Publiser</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Publiser ny versjon</DialogTitle>
          <DialogDescription>
            Er du sikker på at du vil publisere denne versjonen? 
            Den vil erstatte den nåværende publiserte versjonen.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPublishing}
          >
            Avbryt
          </Button>
          <Button 
            onClick={publishDraft}
            disabled={isPublishing}
          >
            {isPublishing ? "Publiserer..." : "Publiser"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 