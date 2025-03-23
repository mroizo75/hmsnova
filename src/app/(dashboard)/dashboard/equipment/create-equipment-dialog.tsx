"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
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
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const formSchema = z.object({
  name: z.string().min(2, "Navn må være minst 2 tegn"),
  type: z.string().min(1, "Velg type"),
  category: z.string().min(1, "Velg kategori"),
  serialNumber: z.string().min(1, "Serienummer er påkrevd"),
  location: z.string().min(1, "Plassering er påkrevd"),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  purchaseDate: z.date().optional(),
  nextInspection: z.date().optional(),
  description: z.string().optional(),
  status: z.string().default("ACTIVE"),
  notes: z.string().optional(),
})

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (equipment: any) => void
}

export function CreateEquipmentDialog({ open, onOpenChange, onSuccess }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "ACTIVE",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)
      
      const response = await fetch('/api/equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Ukjent feil' }));
        toast.error(`Kunne ikke opprette utstyr: ${errorData.message || 'Kontakt systemadministrator'}`)
        throw new Error('Kunne ikke opprette utstyr')
      }

      const equipment = await response.json()
      onSuccess(equipment)
      toast.success('Utstyr opprettet')
      onOpenChange(false)
    } catch (error) {
      toast.error('Noe gikk galt')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrer nytt utstyr</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Navn *</FormLabel>
                      <FormControl>
                        <Input placeholder="Utstyrsnavn" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Velg type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="MACHINE">Maskin</SelectItem>
                          <SelectItem value="TOOL">Verktøy</SelectItem>
                          <SelectItem value="VEHICLE">Kjøretøy</SelectItem>
                          <SelectItem value="SAFETY">Sikkerhetsutstyr</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kategori *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Velg kategori" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="LIFTING">Løfteutstyr</SelectItem>
                          <SelectItem value="ELECTRICAL">Elektrisk</SelectItem>
                          <SelectItem value="MECHANICAL">Mekanisk</SelectItem>
                          <SelectItem value="HAND_TOOL">Håndverktøy</SelectItem>
                          <SelectItem value="OTHER">Annet</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="serialNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Serienummer *</FormLabel>
                      <FormControl>
                        <Input placeholder="Serienummer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plassering *</FormLabel>
                      <FormControl>
                        <Input placeholder="F.eks. Lager A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="manufacturer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Produsent</FormLabel>
                      <FormControl>
                        <Input placeholder="Produsent" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modell</FormLabel>
                      <FormControl>
                        <Input placeholder="Modell" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="purchaseDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kjøpsdato</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
                          {...field}
                          value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                          onChange={(e) => {
                            const date = e.target.value ? new Date(e.target.value) : undefined
                            field.onChange(date)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nextInspection"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Neste inspeksjon</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
                          {...field}
                          min={new Date().toISOString().split('T')[0]}
                          value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                          onChange={(e) => {
                            const date = e.target.value ? new Date(e.target.value) : undefined
                            field.onChange(date)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beskrivelse</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Beskriv utstyret..."
                        className="resize-none h-20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notater</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Andre notater..."
                        className="resize-none h-20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Avbryt
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Lagrer..." : "Lagre"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 