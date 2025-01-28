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
import React from "react"
import { statusLabels } from "@/lib/constants/deviations"
import { useQueryClient } from "@tanstack/react-query"
import { Status } from "@prisma/client"

const formSchema = z.object({
  status: z.nativeEnum(Status),
  comment: z.string().optional(),
})

interface Deviation {
  id: string
  status: string
  measures: {
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
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: deviation.status as Status,
      comment: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Sjekk om alle tiltak er fullført før lukking
      if (values.status === "LUKKET") {
        const uncompletedMeasures = deviation.measures.filter(
          m => m.status !== "FULLFOERT"
        )
        
        if (uncompletedMeasures.length > 0) {
          toast.error("Alle tiltak må være fullført før avviket kan lukkes")
          return
        }
      }

      const response = await fetch(`/api/deviations/${deviation.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: values.status,
          comment: values.comment
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.details || "Kunne ikke oppdatere status")
      }

      toast.success("Status oppdatert")
      onOpenChange(false)
      await onUpdate()
      
      router.refresh()
      setTimeout(() => {
        router.refresh()
      }, 100)

    } catch (error) {
      console.error('Error updating status:', error)
      toast.error(error instanceof Error ? error.message : "Kunne ikke oppdatere status")
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
                        <SelectValue placeholder="Velg status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
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