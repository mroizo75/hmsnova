"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { SJAWithRelations } from "./types"

interface SlettSJADialogProps {
  sja: SJAWithRelations
  open: boolean
  onOpenChange: (open: boolean) => void
  onSlett: (sjaId: string) => void
}

export function SlettSJADialog({ sja, open, onOpenChange, onSlett }: SlettSJADialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleSlett = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/sja/${sja.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Kunne ikke slette SJA')
      }

      onSlett(sja.id)
      onOpenChange(false)
      toast.success('SJA slettet')
    } catch (error) {
      console.error('Feil ved sletting av SJA:', error)
      toast.error('Kunne ikke slette SJA')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Er du sikker på at du vil slette denne SJA-en?</AlertDialogTitle>
          <AlertDialogDescription>
            Dette vil permanent slette SJA-en &quot;{sja.tittel}&quot; og alle tilhørende data. 
            Denne handlingen kan ikke angres.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Avbryt</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleSlett}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeleting ? "Sletter..." : "Slett SJA"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 