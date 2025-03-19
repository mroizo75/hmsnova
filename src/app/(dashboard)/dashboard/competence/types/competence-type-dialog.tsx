"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
  SelectValue,
} from "@/components/ui/select"
import { Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"

const predefinedCategories = [
  "HMS",
  "Sertifikater",
  "Kurs",
  "Utdanning",
  "Fagbrev",
  "Førerkort",
  "Annet"
]

// Schema for validering
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Navn må være minst 2 tegn."
  }).max(100, {
    message: "Navn kan ikke være mer enn 100 tegn."
  }),
  description: z.string().optional(),
  category: z.string().min(2, {
    message: "Kategori må være minst 2 tegn."
  }).max(50, {
    message: "Kategori kan ikke være mer enn 50 tegn."
  }),
  validity: z.coerce.number().int().nonnegative().nullable().optional(),
  reminderMonths: z.coerce.number().int().min(1).max(24).default(3).optional(),
  customCategory: z.string().max(50).optional(),
})

type CompetenceType = {
  id: string
  name: string
  description: string | null
  category: string
  validity: number | null
  reminderMonths: number | null
  isActive: boolean
  companyId: string
  createdAt: Date
  updatedAt: Date
}

type CompetenceTypeDialogProps = {
  children?: React.ReactNode
  type?: CompetenceType
  initialCategory?: string
}

export function CompetenceTypeDialog({ 
  children, 
  type,
  initialCategory 
}: CompetenceTypeDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [useCustomCategory, setUseCustomCategory] = useState(false)
  
  const isEditing = !!type
  
  // Initier form med eksisterende data eller tomme verdier
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: type?.name || "",
      description: type?.description || "",
      category: type?.category || initialCategory || "HMS",
      validity: type?.validity || null,
      reminderMonths: type?.reminderMonths || 3,
      customCategory: "",
    },
  })
  
  // Velg riktig API-endepunkt basert på om vi redigerer eller oppretter ny
  const apiEndpoint = isEditing
    ? `/api/dashboard/competence/types/${type.id}`
    : "/api/dashboard/competence/types"
  
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    
    // Erstatt kategorien med egendefinert kategori hvis valgt
    if (useCustomCategory && data.customCategory) {
      data.category = data.customCategory
    }
    
    try {
      const response = await fetch(apiEndpoint, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Noe gikk galt")
      }
      
      toast.success(
        isEditing
          ? "Kompetansetype ble oppdatert"
          : "Ny kompetansetype ble opprettet"
      )
      
      // Lukk dialogen og oppdater siden for å vise de nye dataene
      setOpen(false)
      window.location.reload()
      
    } catch (error) {
      console.error("Error:", error)
      toast.error(`Feil: ${(error as Error).message}`)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Legg til kompetansetype
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="w-[90vw] max-w-[600px] p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Rediger kompetansetype" : "Legg til kompetansetype"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Oppdater detaljer for kompetansetypen"
              : "Fyll ut feltene for å opprette en ny kompetansetype"
            }
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Navn <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="F.eks. Trucksertifikat" {...field} />
                  </FormControl>
                  <FormDescription>
                    Navnet på kompetansetypen som vises til ansatte
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori <span className="text-red-500">*</span></FormLabel>
                    <div className="space-y-2">
                      {!useCustomCategory ? (
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Velg kategori" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {predefinedCategories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <FormField
                          control={form.control}
                          name="customCategory"
                          render={({ field }) => (
                            <FormControl>
                              <Input placeholder="Skriv inn egendefinert kategori" {...field} />
                            </FormControl>
                          )}
                        />
                      )}
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full md:w-auto text-xs md:text-sm"
                        onClick={() => setUseCustomCategory(!useCustomCategory)}
                      >
                        {useCustomCategory 
                          ? "Bruk forhåndsdefinert kategori" 
                          : "Bruk egendefinert kategori"
                        }
                      </Button>
                    </div>
                    <FormDescription className="text-xs md:text-sm">
                      Gruppér lignende kompetansetyper sammen
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="validity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gyldighetsperiode (måneder)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          placeholder="F.eks. 12" 
                          {...field}
                          value={field.value === null ? "" : field.value}
                          onChange={(e) => {
                            const value = e.target.value === "" ? null : parseInt(e.target.value)
                            field.onChange(value)
                          }}
                        />
                      </FormControl>
                      <FormDescription className="text-xs md:text-sm">
                        Angi lengden på gyldighetsperioden, eller la stå tom hvis kompetansen ikke utløper
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="reminderMonths"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Påminnelse (måneder før utløp)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1"
                          max="24"
                          placeholder="3" 
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs md:text-sm">
                        Antall måneder før utløpsdato det skal sendes påminnelse
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beskrivelse</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Skriv en kort beskrivelse av denne kompetansetypen..." 
                      className="h-20"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs md:text-sm">
                    Beskrivelse av hva kompetansen innebærer (valgfritt)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                Avbryt
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full sm:w-auto order-1 sm:order-2"
              >
                {isSubmitting ? 'Lagrer...' : isEditing ? 'Oppdater' : 'Opprett'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 