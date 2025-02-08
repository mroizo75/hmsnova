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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { useState, useEffect } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

const formSchema = z.object({
  title: z.string().min(2, "Tittel må være minst 2 tegn"),
  description: z.string().min(10, "Beskrivelse må være minst 10 tegn"),
  department: z.string().optional(),
  activity: z.string().min(2, "Aktivitet må spesifiseres"),
  dueDate: z.string().optional(),
  isEquipmentAssessment: z.boolean().default(false),
  equipmentId: z.string().optional(),
  equipmentName: z.string().optional()
})

interface CreateAssessmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateAssessmentDialog({ open, onOpenChange }: CreateAssessmentDialogProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEquipmentAssessment, setIsEquipmentAssessment] = useState(false)
  const [equipment, setEquipment] = useState<Array<{ id: string, name: string }>>([])
  const [isLoadingEquipment, setIsLoadingEquipment] = useState(false)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      department: "",
      activity: "",
      dueDate: "",
      isEquipmentAssessment: false,
      equipmentId: "",
      equipmentName: "",
    },
  })

  useEffect(() => {
    if (open) {
      fetchEquipment()
    }
  }, [open])

  const fetchEquipment = async () => {
    setIsLoadingEquipment(true)
    try {
      const response = await fetch('/api/equipment')
      if (response.ok) {
        const data = await response.json()
        setEquipment(data)
      }
    } catch (error) {
      console.error('Feil ved henting av utstyr:', error)
    } finally {
      setIsLoadingEquipment(false)
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)
      const response = await fetch('/api/risk-assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message)
      }

      toast.success("Risikovurdering opprettet")
      form.reset()
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error 
          ? error.message 
          : "Kunne ikke opprette risikovurdering"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Ny risikovurdering
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Opprett risikovurdering</DialogTitle>
          <DialogDescription>
            Fyll ut informasjon om risikovurderingen.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-6 -mr-6">
          <Form {...form}>
            <form id="risk-assessment-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tittel</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="F.eks. Fallrisiko ved arbeid i høyden" />
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
                        placeholder="Beskriv formålet med risikovurderingen..."
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avdeling/Område</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="F.eks. Produksjon" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="activity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aktivitet</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="F.eks. Vedlikehold av tak" />
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
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isEquipmentAssessment"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked)
                          setIsEquipmentAssessment(checked as boolean)
                        }}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Utstyrsvurdering
                      </FormLabel>
                      <FormDescription>
                        Velg dette hvis risikovurderingen gjelder spesifikt utstyr
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {isEquipmentAssessment && (
                <FormField
                  control={form.control}
                  name="equipmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Velg utstyr</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Velg utstyr" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {equipment.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </form>
          </Form>
        </div>

        <div className="flex justify-end pt-6 mt-6 border-t">
          <Button type="submit" form="risk-assessment-form" disabled={isSubmitting}>
            {isSubmitting ? "Oppretter..." : "Opprett risikovurdering"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 