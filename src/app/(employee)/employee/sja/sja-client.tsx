'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { ImageUpload } from "@/components/ui/image-upload"
import { StoffkartotekSelect } from "./stoffkartotek-select"

const sjaFormSchema = z.object({
  tittel: z.string().min(1, "Tittel er påkrevd"),
  arbeidssted: z.string().min(1, "Arbeidssted er påkrevd"),
  beskrivelse: z.string().min(1, "Beskrivelse er påkrevd"),
  startDato: z.date(),
  sluttDato: z.date(),
  deltakere: z.string().min(1, "Deltakere er påkrevd"),
  identifiedRisks: z.string().min(1, "Identifiserte risikoer er påkrevd"),
  riskMitigation: z.string().min(1, "Risikoreduserende tiltak er påkrevd"),
  responsiblePerson: z.string().min(1, "Ansvarlig person er påkrevd"),
  comments: z.string().optional(),
  bilder: z.array(z.string()).default([]),
  produkter: z.array(z.string()).default([])
})

export function SJAClient() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof sjaFormSchema>>({
    resolver: zodResolver(sjaFormSchema),
    defaultValues: {
      tittel: "",
      arbeidssted: "",
      beskrivelse: "",
      startDato: new Date(),
      sluttDato: new Date(),
      deltakere: "",
      identifiedRisks: "",
      riskMitigation: "",
      responsiblePerson: "",
      comments: "",
      bilder: [],
      produkter: []
    }
  })

  const onSubmit = async (values: z.infer<typeof sjaFormSchema>) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/sja', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          startDato: values.startDato.toISOString(),
          sluttDato: values.sluttDato.toISOString()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Kunne ikke opprette SJA')
      }

      toast.success('SJA er opprettet', {
        description: 'Du blir nå sendt tilbake til dashbordet'
      })
      
      setTimeout(() => {
        router.push('/employee-dashboard')
      }, 2000)

    } catch (error) {
      console.error('SJA creation error:', error)
      toast.error(error instanceof Error ? error.message : 'Noe gikk galt ved opprettelse av SJA')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="max-w-3xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6">
          <FormField
            control={form.control}
            name="tittel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tittel</FormLabel>
                <FormControl>
                  <Input placeholder="Skriv tittel på SJA" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="arbeidssted"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Arbeidssted</FormLabel>
                <FormControl>
                  <Input placeholder="Hvor skal arbeidet utføres?" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <FormField
              control={form.control}
              name="startDato"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Startdato</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Velg dato</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date()
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sluttDato"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Sluttdato</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Velg dato</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date()
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="beskrivelse"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Beskrivelse av arbeidet</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Beskriv arbeidet som skal utføres"
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
            name="deltakere"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deltakere</FormLabel>
                <FormControl>
                  <Input placeholder="Navn på deltakere" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="identifiedRisks"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Identifiserte risikoer</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Beskriv identifiserte risikoer"
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
            name="riskMitigation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Risikoreduserende tiltak</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Beskriv tiltak for å redusere risiko"
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
            name="responsiblePerson"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ansvarlig person</FormLabel>
                <FormControl>
                  <Input placeholder="Navn på ansvarlig person" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="comments"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kommentarer (valgfritt)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Andre kommentarer eller merknader"
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
            name="bilder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bilder</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value[0]}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="produkter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Produkter fra stoffkartotek</FormLabel>
                <FormControl>
                  <StoffkartotekSelect
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormDescription>
                  Velg produkter som skal brukes i arbeidet
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Avbryt
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Opprett SJA
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  )
} 