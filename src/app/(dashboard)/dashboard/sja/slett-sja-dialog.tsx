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
import { useQueryClient } from "@tanstack/react-query"

interface SlettSJADialogProps {
  sja: SJAWithRelations
  open: boolean
  onOpenChange: (open: boolean) => void
  onSlett: (sjaId: string) => void
}

export function SlettSJADialog({ sja, open, onOpenChange, onSlett }: SlettSJADialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const queryClient = useQueryClient()

  const handleSlett = async () => {
    console.log('handleSlett started for id:', sja.id)
    setIsDeleting(true)

    try {
      // Sjekk om SJA fortsatt eksisterer i cachen
      const currentData = queryClient.getQueryData(['sja-list']) as SJAWithRelations[]
      const sjaExists = currentData?.some(s => s.id === sja.id)
      
      if (!sjaExists) {
        toast.error('SJA finnes ikke lenger')
        onOpenChange(false)
        return
      }

      // Optimistisk oppdatering
      queryClient.setQueryData(['sja-list'], (old: SJAWithRelations[] = []) => 
        old.filter(s => s.id !== sja.id)
      )

      console.log('Sending DELETE request...')
      const response = await fetch(`/api/sja/${sja.id}`, {
        method: 'DELETE'
      })

      const result = await response.json()
      console.log('DELETE response:', result)

      if (!response.ok) {
        // Tilbakestill data ved feil
        queryClient.setQueryData(['sja-list'], currentData)
        
        if (response.status === 404) {
          toast.error('SJA finnes ikke lenger')
          onOpenChange(false)
          return
        }
        
        throw new Error(result.error || 'Kunne ikke slette SJA')
      }

      // Ved suksess
      onSlett(sja.id || '')
      onOpenChange(false)
      toast.success('SJA slettet')
    } catch (error) {
      console.error('Error in handleSlett:', error)
      toast.error(error instanceof Error ? error.message : 'Kunne ikke slette SJA')
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