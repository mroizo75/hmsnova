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
import { Input } from "@/components/ui/input"
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
import { Plus, Upload } from "lucide-react"
import { useState, useEffect } from "react"
import React from "react"
import { typeLabels, categoryOptions, DEVIATION_STATUS } from "@/lib/constants/deviations"
import { Checkbox } from "@/components/ui/checkbox"
import { DeviationType } from "@prisma/client"

const formSchema = z.object({
  title: z.string().min(2, "Tittel må være minst 2 tegn"),
  description: z.string().min(5, "Beskrivelse må være minst 5 tegn"),
  type: z.nativeEnum(DeviationType),
  category: z.string().min(1, "Velg kategori"),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  location: z.string().optional(),
  dueDate: z.string().optional(),
  image: z.any().optional(),
  equipmentId: z.string().optional().nullable(),
  maintenanceRequired: z.boolean().default(false)
})

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateDeviationDialog({ open, onOpenChange }: Props) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [equipment, setEquipment] = useState<any[]>([])

  useEffect(() => {
    if (open) {
      fetch('/api/equipment')
        .then(res => res.json())
        .then(data => setEquipment(data))
        .catch(err => console.error('Feil ved henting av utstyr:', err))
    }
  }, [open])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "OBSERVATION" as DeviationType,
      category: "",
      severity: "LOW",
      location: "",
      dueDate: "",
      image: undefined,
      equipmentId: "",
      maintenanceRequired: false
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Form values:", values)
    try {
      setIsSubmitting(true)
      const formData = new FormData()
      console.log("Creating FormData...")

      const formattedValues = {
        ...values,
        dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
        equipmentId: values.equipmentId || null
      }

      formData.append('status', DEVIATION_STATUS.OPEN)

      Object.entries(formattedValues).forEach(([key, value]) => {
        if (value !== null && value !== undefined && key !== 'image') {
          formData.append(key, value.toString())
          console.log(`Appending ${key}:`, value)
        }
      })

      if (selectedImage) {
        formData.append('image', selectedImage)
      }

      const response = await fetch('/api/deviations', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        if (response.status === 400 && result.details) {
          result.details.forEach((error: any) => {
            toast.error(`${error.path.join('.')}: ${error.message}`)
          })
          return
        }
        throw new Error(result.error || 'Kunne ikke opprette avvik')
      }

      toast.success('Avvik opprettet')
      form.reset()
      setSelectedImage(null)
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('Kunne ikke opprette avvik')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedImage(e.target.files[0])
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Registrer avvik
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Registrer nytt avvik</DialogTitle>
          <DialogDescription>
            Fyll ut skjemaet under for å registrere et nytt avvik eller en hendelse.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="max-h-[500px] overflow-y-auto pr-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tittel</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Kort beskrivende tittel..." />
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
                        {...field} 
                        placeholder="Beskriv avviket eller hendelsen..."
                        rows={5}
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
                    <FormLabel>Type avvik *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Velg type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="NEAR_MISS">Nestenulykke</SelectItem>
                        <SelectItem value="INCIDENT">Hendelse</SelectItem>
                        <SelectItem value="ACCIDENT">Ulykke</SelectItem>
                        <SelectItem value="IMPROVEMENT">Forbedringsforslag</SelectItem>
                        <SelectItem value="OBSERVATION">Observasjon</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alvorlighetsgrad *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        {categoryOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sted</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Hvor skjedde det..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frist</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
                          {...field}
                          value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                          onChange={(e) => field.onChange(e.target.value || null)}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bilde</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-4">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="flex-1"
                        />
                        {selectedImage && (
                          <p className="text-sm text-muted-foreground">
                            {selectedImage.name}
                          </p>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="equipmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Utstyr</FormLabel>
                    <Select onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Velg utstyr" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {equipment.map((item: any) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name} - {item.serialNumber}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="maintenanceRequired"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Krever vedlikehold</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end pt-4 border-t mt-4">
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