"use client"

import { useState, useEffect } from "react"
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
import { typeLabels, categoryOptions, DEVIATION_STATUS } from "@/lib/constants/deviations"
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

export function NewDeviationForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [equipment, setEquipment] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/equipment')
      .then(res => res.json())
      .then(data => setEquipment(data))
      .catch(err => console.error('Feil ved henting av utstyr:', err))
  }, [])

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
    }
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedImage(e.target.files[0])
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)
      const formData = new FormData()

      const formattedValues = {
        ...values,
        dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
        equipmentId: values.equipmentId || null,
        status: DEVIATION_STATUS.OPEN
      }

      Object.entries(formattedValues).forEach(([key, value]) => {
        if (value !== null && value !== undefined && key !== 'image') {
          formData.append(key, value.toString())
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
      router.push('/employee-dashboard')
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

  return (
    <div className="container max-w-2xl mx-auto p-4">
      <Card className="p-4 md:p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tittel</FormLabel>
                  <FormControl>
                    <Input placeholder="Kort beskrivende tittel..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Velg type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(typeLabels).map(([value, label]) => (
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
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Velg kategori" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoryOptions.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alvorlighetsgrad</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
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
                    <FormLabel>Sted</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Hvor skjedde det..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                      className="min-h-[120px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
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
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bilde</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="w-full"
                        />
                        {selectedImage && (
                          <div className="relative">
                            <img
                              src={URL.createObjectURL(selectedImage)}
                              alt="Preview"
                              className="w-full h-32 object-cover rounded-md"
                            />
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                Avbryt
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Meld avvik
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  )
} 