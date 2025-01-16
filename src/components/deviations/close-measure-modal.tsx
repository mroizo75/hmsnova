'use client'

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const closeMeasureSchema = z.object({
  closeComment: z.string().min(10, "Begrunnelse må være minst 10 tegn"),
  closureVerifiedBy: z.string().optional()
})

type CloseMeasureFormValues = z.infer<typeof closeMeasureSchema>

interface CloseMeasureModalProps {
  isOpen: boolean
  onClose: () => void
  measureId: string
  deviationId: string
  onSuccess?: () => void
}

export function CloseMeasureModal({
  isOpen,
  onClose,
  measureId,
  deviationId,
  onSuccess
}: CloseMeasureModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Debug logging
  console.log('Modal props:', { isOpen, measureId, deviationId })

  const form = useForm<CloseMeasureFormValues>({
    resolver: zodResolver(closeMeasureSchema),
    defaultValues: {
      closeComment: "",
      closureVerifiedBy: undefined
    }
  })

  async function onSubmit(values: CloseMeasureFormValues) {
    try {
      setIsSubmitting(true)
      
      const response = await fetch(`/api/deviations/${deviationId}/measures`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          measureId,
          ...values
        }),
      })

      if (!response.ok) {
        throw new Error('Kunne ikke lukke tiltaket')
      }

      toast.success('Tiltaket er lukket')
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Error closing measure:', error)
      toast.error('Kunne ikke lukke tiltaket')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        console.log('Dialog open state changed:', open) // Debug logging
        if (!open) onClose()
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Lukk tiltak</DialogTitle>
          <DialogDescription>
            Fyll ut begrunnelse for hvorfor tiltaket lukkes. Dette er viktig for sporbarhet.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="closeComment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Begrunnelse</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Beskriv hvorfor tiltaket lukkes og hva som er gjort..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="closureVerifiedBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verifisert av (valgfritt)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Navn på person som har verifisert at tiltaket er gjennomført"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Avbryt
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Lukk tiltak
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 