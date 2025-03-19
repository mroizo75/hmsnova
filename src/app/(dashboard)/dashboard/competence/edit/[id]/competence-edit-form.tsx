'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import { nb } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

// Schema for form validation
const formSchema = z.object({
  competenceTypeId: z.string({
    required_error: 'Vennligst velg en kompetansetype',
  }),
  achievedDate: z.date({
    required_error: 'Vennligst velg oppnådd dato',
  }),
  expiryDate: z.date().nullable().optional(),
  notes: z.string().max(1000, 'Noter kan ikke være lengre enn 1000 tegn').optional(),
  verificationStatus: z.enum(['PENDING', 'VERIFIED', 'REJECTED'], {
    required_error: 'Vennligst velg verifiseringsstatus',
  }),
})

type FormValues = z.infer<typeof formSchema>

interface CompetenceType {
  id: string
  name: string
  validity: number | null
}

interface User {
  id: string
  name: string | null
}

interface Competence {
  id: string
  userId: string
  competenceTypeId: string
  achievedDate: Date
  expiryDate: Date | null
  certificateUrl: string | null
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED'
  notes: string | null
  user: User
  competenceType: CompetenceType
}

interface CompetenceEditFormProps {
  competence: Competence
  competenceTypes: CompetenceType[]
  isAdmin: boolean
}

export function CompetenceEditForm({ competence, competenceTypes, isAdmin }: CompetenceEditFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form with existing values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      competenceTypeId: competence.competenceTypeId,
      achievedDate: new Date(competence.achievedDate),
      expiryDate: competence.expiryDate ? new Date(competence.expiryDate) : null,
      notes: competence.notes || '',
      verificationStatus: competence.verificationStatus,
    },
  })

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true)
      
      const response = await fetch(`/api/dashboard/competence/${competence.id}/update`, {
        method: 'PUT',
        body: JSON.stringify(values),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Kunne ikke oppdatere kompetansen')
      }

      toast({
        title: 'Kompetanse oppdatert',
        description: 'Kompetansedetaljene har blitt oppdatert',
        variant: 'default',
      })
      
      router.push(`/dashboard/competence/details/${competence.id}`)
      router.refresh()
    } catch (error) {
      console.error('Feil ved oppdatering av kompetanse:', error)
      toast({
        title: 'Feil ved oppdatering',
        description: error instanceof Error ? error.message : 'Kunne ikke oppdatere kompetansen',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle calculation of expiry date based on competence type validity
  const handleCompetenceTypeChange = (competenceTypeId: string) => {
    const selectedType = competenceTypes.find(type => type.id === competenceTypeId)
    const achievedDate = form.getValues('achievedDate')
    
    if (selectedType && selectedType.validity && achievedDate) {
      const expiryDate = new Date(achievedDate)
      expiryDate.setMonth(expiryDate.getMonth() + selectedType.validity)
      form.setValue('expiryDate', expiryDate)
    } else {
      form.setValue('expiryDate', null)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="competenceTypeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kompetansetype</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value)
                  handleCompetenceTypeChange(value)
                }}
                defaultValue={field.value}
                disabled={!isAdmin}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Velg kompetansetype" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {competenceTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Velg type kompetanse eller sertifisering
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="achievedDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Oppnådd dato</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className="w-full pl-3 text-left font-normal"
                        disabled={!isAdmin}
                      >
                        {field.value ? (
                          format(field.value, 'PPP', { locale: nb })
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
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Dato kompetansen ble oppnådd
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expiryDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Utløpsdato</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className="w-full pl-3 text-left font-normal"
                        disabled={!isAdmin}
                      >
                        {field.value ? (
                          format(field.value, 'PPP', { locale: nb })
                        ) : (
                          <span>Utløper ikke</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-2 border-b">
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full justify-start text-left font-normal"
                        onClick={() => field.onChange(null)}
                      >
                        Utløper ikke
                      </Button>
                    </div>
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={field.onChange}
                      disabled={(date) => date < (form.getValues('achievedDate') || new Date())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Dato kompetansen utløper (hvis relevant)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {isAdmin && (
          <FormField
            control={form.control}
            name="verificationStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Verifiseringsstatus</FormLabel>
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
                    <SelectItem value="PENDING">Venter på godkjenning</SelectItem>
                    <SelectItem value="VERIFIED">Verifisert</SelectItem>
                    <SelectItem value="REJECTED">Avvist</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Angi godkjenningsstatus for denne kompetansen
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notater</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Skriv eventuelle merknader om denne kompetansen"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Tilleggsinformasjon om kompetansen (valgfritt)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/dashboard/competence/details/${competence.id}`)}
            disabled={isSubmitting}
          >
            Avbryt
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Lagrer...' : 'Lagre endringer'}
          </Button>
        </div>
      </form>
    </Form>
  )
} 