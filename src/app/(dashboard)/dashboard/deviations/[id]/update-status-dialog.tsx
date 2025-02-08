"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { ClipboardEdit } from "lucide-react"
import React, { ReactNode } from "react"
import { statusLabels } from "@/lib/constants/status"
import { useQueryClient } from "@tanstack/react-query"
import { Status } from "@prisma/client"
import { deviationStatusLabels, DEVIATION_STATUSES, isValidDeviationStatus } from "@/lib/constants/deviation-status"

const formSchema = z.object({
  status: z.nativeEnum(Status).refine(
    status => isValidDeviationStatus(status),
    { message: "Ugyldig status for avvik" }
  ),
  comment: z.string().optional(),
})

interface Deviation {
  id: string
  status: string
  measures: {
    [x: string]: ReactNode
    id: string
    status: string
  }[]
}

interface Props {
  deviation: Deviation
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: () => Promise<void>
}

export function UpdateStatusDialog({ deviation, open, onOpenChange, onUpdate }: Props) {
  const router = useRouter()
  const queryClient = useQueryClient()
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: deviation.status as Status,
      comment: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log('Attempting to update status to:', values.status)
      
      // Sjekk om alle tiltak er fullført før lukking
      if (values.status === 'LUKKET') {
        console.log('Checking measures for CLOSED status')
        const uncompletedMeasures = deviation.measures.filter(
          m => m.status !== "CLOSED"
        )
        
        if (uncompletedMeasures.length > 0) {
          toast.error(
            <div className="space-y-2">
              <p>Kan ikke lukke avviket ennå</p>
              <p className="text-sm">
                Du har {uncompletedMeasures.length} ufullførte tiltak
              </p>
            </div>
          )
          return
        }
      }

      const response = await fetch(`/api/deviations/${deviation.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: values.status,
          comment: values.comment || undefined // Kun send med comment hvis den har en verdi
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Kunne ikke oppdatere status")
      }

      toast.success(
        <div>
          <p>Status oppdatert</p>
          <p className="text-sm">
            Avviket er nå {statusLabels[values.status].toLowerCase()}
          </p>
        </div>
      )
      
      onOpenChange(false)
      await onUpdate()
      router.refresh()
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error(
        <div>
          <p>Kunne ikke oppdatere status</p>
          <p className="text-sm">
            {error instanceof Error ? error.message : "En uventet feil oppstod"}
          </p>
        </div>
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <ClipboardEdit className="h-4 w-4 mr-2" />
          Endre status
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Oppdater status</DialogTitle>
          <DialogDescription>
            Endre status på avviket og legg til en kommentar.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Velg status">
                          {field.value ? deviationStatusLabels[field.value as Status] : "Velg status"}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(DEVIATION_STATUSES).map(([key, value]) => (
                        <SelectItem key={value} value={value}>
                          {deviationStatusLabels[value]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kommentar (valgfritt)</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Legg til en kommentar..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit">
                Oppdater status
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 