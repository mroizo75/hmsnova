"use client"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ImageUpload } from "@/components/ui/image-upload"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const deviationFormSchema = z.object({
  title: z.string().min(1, "Tittel er påkrevd"),
  description: z.string().min(1, "Beskrivelse er påkrevd"),
  type: z.enum(["HMS", "KVALITET", "MILJO", "ANNET"]),
  category: z.string().min(1, "Kategori er påkrevd"),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  location: z.string().min(1, "Lokasjon er påkrevd"),
  images: z.array(z.string()).default([])
})

export function NewDeviationForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof deviationFormSchema>>({
    resolver: zodResolver(deviationFormSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "HMS",
      category: "",
      severity: "LOW",
      location: "",
      images: []
    }
  })

  async function onSubmit(values: z.infer<typeof deviationFormSchema>) {
    console.log("Starting submission with values:", values)
    setIsSubmitting(true)
    
    try {
      console.log("Sending request to /api/deviations")
      const response = await fetch('/api/deviations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })

      console.log("Response status:", response.status)
      const data = await response.json()
      console.log("Response data:", data)

      if (!response.ok) {
        throw new Error(data.error || 'Kunne ikke opprette avvik')
      }

      toast.success('Avvik er meldt inn', {
        description: 'Du blir nå sendt tilbake til dashbordet'
      })
      
      setTimeout(() => {
        router.push('/employee-dashboard')
      }, 2000)

    } catch (error) {
      console.error('Deviation creation error:', error)
      toast.error(error instanceof Error ? error.message : 'Noe gikk galt ved innmelding av avvik')
    } finally {
      setIsSubmitting(false)
    }
  }

  console.log("Form state:", form.formState.errors)

  return (
    <Card className="max-w-3xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tittel</FormLabel>
                <FormControl>
                  <Input placeholder="Kort beskrivende tittel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Beskrivelse</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Beskriv avviket"
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
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type avvik</FormLabel>
                <Select 
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Velg type avvik" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="HMS">HMS</SelectItem>
                    <SelectItem value="KVALITET">Kvalitet</SelectItem>
                    <SelectItem value="MILJO">Miljø</SelectItem>
                    <SelectItem value="ANNET">Annet</SelectItem>
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
                <FormLabel>Kategori</FormLabel>
                <FormControl>
                  <Input placeholder="F.eks. Sikkerhet, Utstyr, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="severity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alvorlighetsgrad</FormLabel>
                <Select 
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Velg alvorlighetsgrad" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="LOW">Lav</SelectItem>
                    <SelectItem value="MEDIUM">Middels</SelectItem>
                    <SelectItem value="HIGH">Høy</SelectItem>
                    <SelectItem value="CRITICAL">Kritisk</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lokasjon</FormLabel>
                <FormControl>
                  <Input placeholder="Hvor skjedde avviket?" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bilder</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value}
                    onChange={field.onChange}
                    maxFiles={5}
                  />
                </FormControl>
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
              Meld avvik
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  )
} 