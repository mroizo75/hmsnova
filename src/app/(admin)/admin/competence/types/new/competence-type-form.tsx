"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Switch } from "@/components/ui/switch"

// Valideringsskjema for kompetansetype
const formSchema = z.object({
  name: z.string().min(2, "Navn må være minst 2 tegn"),
  description: z.string().optional(),
  category: z.string().min(1, "Kategori er påkrevd"),
  subcategory: z.string().optional(),
  validity: z.union([
    z.number().int().positive("Gyldighet må være et positivt tall"),
    z.literal(0)
  ]).nullable(),
  reminderMonths: z.number().int().min(1, "Må være minst 1 måned").default(3),
  requiredFor: z.string().optional(),
  isDefault: z.boolean().default(false)
})

export function CompetenceTypeForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      subcategory: "",
      validity: null,
      reminderMonths: 3,
      requiredFor: "",
      isDefault: false
    }
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/competence/types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Kunne ikke opprette kompetansetype')
      }

      toast.success('Kompetansetype opprettet')
      router.push('/admin/competence/types')
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Kunne ikke opprette kompetansetype'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Navn</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} />
              </FormControl>
              <FormDescription>
                Navn på kompetansetypen (f.eks. "HMS-kurs", "Truckførerbevis")
              </FormDescription>
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
                  {...field} 
                  disabled={isLoading}
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>
                Detaljert beskrivelse av kompetansetypen
              </FormDescription>
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
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Velg kategori" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="HMS">HMS</SelectItem>
                  <SelectItem value="FAGLIG">Faglig</SelectItem>
                  <SelectItem value="LOVPÅLAGT">Lovpålagt</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Hovedkategori for kompetansetypen
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 justify-end">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.push('/admin/competence/types')}
            disabled={isLoading}
          >
            Avbryt
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Lagre kompetansetype
          </Button>
        </div>
      </form>
    </Form>
  )
}
