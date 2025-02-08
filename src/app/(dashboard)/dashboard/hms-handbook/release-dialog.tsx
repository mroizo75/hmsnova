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

interface ReleaseDialogProps {
  handbookId: string
  currentVersion: number
  isDraft?: boolean // Ny prop for å indikere om dette er en kladd
}

export function ReleaseDialog({ handbookId, currentVersion, isDraft }: ReleaseDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const router = useRouter()

  async function handleRelease() {
    try {
      setIsPublishing(true)
      const response = await fetch(`/api/hms-handbook/${handbookId}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          version: currentVersion + 1,
          isDraft
        })
      })

      if (!response.ok) {
        throw new Error(isDraft ? 'Kunne ikke publisere kladden' : 'Kunne ikke publisere ny versjon')
      }

      toast.success(isDraft ? 'Kladden er nå publisert' : 'Ny versjon er publisert')
      setOpen(false)
      
      // Hvis dette var en kladd, naviger tilbake til hovedvisningen
      if (isDraft) {
        router.push('/dashboard/hms-handbook')
      } else {
        router.refresh()
      }
    } catch (error) {
      toast.error(isDraft ? 'Kunne ikke publisere kladden' : 'Kunne ikke publisere ny versjon')
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">
          {isDraft ? "Publiser kladd" : "Publiser ny versjon"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isDraft ? "Publiser kladd" : "Publiser ny versjon"}
          </DialogTitle>
          <DialogDescription>
            {isDraft 
              ? "Er du sikker på at du vil publisere denne kladden? Den vil erstatte den nåværende publiserte versjonen."
              : "Er du sikker på at du vil publisere en ny versjon av HMS-håndboken?"
            }
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
            onClick={handleRelease}
            disabled={isPublishing}
          >
            {isPublishing ? "Publiserer..." : "Publiser"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 