"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { SJAWithRelations } from "./types"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { SJAStatus } from "@prisma/client"

const formSchema = z.object({
  status: z.enum([SJAStatus.GODKJENT, SJAStatus.AVVIST], {
    required_error: "Du må velge om SJA skal godkjennes eller avvises"
  }),
  kommentar: z.string().min(1, "Kommentar er påkrevd")
})

interface BehandleSJAModalProps {
  sja: SJAWithRelations
  open: boolean
  onOpenChange: (open: boolean) => void
  onBehandle: (sja: SJAWithRelations) => void
}

export function BehandleSJAModal({ sja, open, onOpenChange, onBehandle }: BehandleSJAModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: undefined,
      kommentar: ""
    }
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/sja/${sja.id}/behandle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      })

      if (!response.ok) {
        throw new Error('Kunne ikke behandle SJA')
      }

      const oppdatertSja = await response.json()
      onBehandle(oppdatertSja)
      onOpenChange(false)
      toast.success(`SJA ${values.status === SJAStatus.GODKJENT ? 'godkjent' : 'avvist'}`)
    } catch (error) {
      console.error('Feil ved behandling av SJA:', error)
      toast.error('Kunne ikke behandle SJA')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Behandle SJA</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Velg handling</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value={SJAStatus.GODKJENT} />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Godkjenn SJA
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value={SJAStatus.AVVIST} />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Avvis SJA
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="kommentar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kommentar</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Skriv en kommentar om hvorfor du godkjenner eller avviser SJA-en"
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Avbryt
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Behandler..." : "Send inn"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 