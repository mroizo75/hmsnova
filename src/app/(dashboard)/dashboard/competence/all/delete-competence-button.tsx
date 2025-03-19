'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'

interface DeleteCompetenceButtonProps {
  competenceId: string
}

export function DeleteCompetenceButton({ competenceId }: DeleteCompetenceButtonProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const handleDelete = async () => {
    if (isLoading) return
    
    try {
      setIsLoading(true)
      const response = await fetch(`/api/dashboard/competence/${competenceId}/delete`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Kunne ikke slette kompetanse')
      }

      toast({
        title: 'Kompetanse slettet',
        description: 'Kompetansen har blitt slettet permanent',
        variant: 'default',
      })
      
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Feil ved sletting av kompetanse:', error)
      toast({
        title: 'Feil ved sletting',
        description: error instanceof Error ? error.message : 'Kunne ikke slette kompetanse',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-red-500 hover:text-red-700 hover:bg-red-100"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Er du sikker på at du vil slette denne kompetansen?</AlertDialogTitle>
          <AlertDialogDescription>
            Denne handlingen kan ikke angres. Dette vil permanent slette kompetansen fra systemet.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Avbryt</AlertDialogCancel>
          <Button
            onClick={handleDelete}
            disabled={isLoading}
            variant="destructive"
          >
            {isLoading ? 'Sletter...' : 'Slett kompetanse'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 