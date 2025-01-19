"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const changeFormSchema = z.object({
  title: z.string().min(3, "Tittel må være minst 3 tegn"),
  description: z.string().min(10, "Beskrivelse må være minst 10 tegn"),
  changeType: z.enum(["POLICY", "PROCEDURE", "TRAINING", "EQUIPMENT", "OTHER"]),
  deviationId: z.string().optional(),
  measures: z.array(z.string()).optional()
})

interface Measure {
  id: string
  description: string
  type: string
  status: string
}

interface Props {
  hazardId?: string
  context?: {
    type: string
    description: string
    riskLevel: number
  }
  deviationId?: string
  riskAssessmentId?: string
  sectionId?: string
  onHasChanges?: (hasChanges: boolean) => void
}

export function HMSChanges({ deviationId, riskAssessmentId, sectionId, onHasChanges }: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [measures, setMeasures] = useState<Measure[]>([])
  const [selectedMeasures, setSelectedMeasures] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof changeFormSchema>>({
    resolver: zodResolver(changeFormSchema),
    defaultValues: {
      title: "",
      description: "",
      changeType: "POLICY"
    }
  })

  useEffect(() => {
    if (!isDialogOpen) {
      form.reset()
      setSelectedMeasures([])
    }
  }, [isDialogOpen, form])

  // Hent tiltak når dialogen åpnes
  useEffect(() => {
    const fetchMeasures = async () => {
      if (!isDialogOpen) return
      
      try {
        setIsLoading(true)
        let response

        if (deviationId) {
          response = await fetch(`/api/deviations/${deviationId}/measures`)
        } else if (riskAssessmentId) {
          response = await fetch(`/api/risk-assessments/${riskAssessmentId}/measures`)
        }

        if (response?.ok) {
          const data = await response.json()
          setMeasures(data)
        }
      } catch (error) {
        toast.error('Kunne ikke hente tiltak')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMeasures()
  }, [isDialogOpen, deviationId, riskAssessmentId])

  const onSubmit = async (data: z.infer<typeof changeFormSchema>) => {
    try {
      setIsLoading(true)
      
      const payload = {
        ...data,
        deviationId: deviationId,
        measures: selectedMeasures
      }

      console.log('Frontend - Full payload:', JSON.stringify(payload, null, 2))

      const response = await fetch('/api/hms/changes', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const responseData = await response.json()
      console.log('Frontend - Response:', {
        status: response.status,
        data: responseData
      })

      if (!response.ok) {
        throw new Error(responseData.error || 'Kunne ikke opprette HMS-endring')
      }
      
      toast.success('HMS-endring opprettet')
      setIsDialogOpen(false)
      onHasChanges?.(true)
    } catch (error) {
      console.error('Frontend - Error:', error)
      toast.error(error instanceof Error ? error.message : 'Kunne ikke opprette HMS-endring')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <Button onClick={() => setIsDialogOpen(true)}>
        <Plus className="w-4 h-4 mr-2" />
        Registrer HMS-endring
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Registrer HMS-endring fra tiltak</DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div>Laster tiltak...</div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tittel på HMS-endring</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Beskrivelse av endringen</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="changeType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type endring</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Velg type endring" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="POLICY">Policy</SelectItem>
                          <SelectItem value="PROCEDURE">Prosedyre</SelectItem>
                          <SelectItem value="TRAINING">Opplæring</SelectItem>
                          <SelectItem value="EQUIPMENT">Utstyr</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel>Velg tiltak som skal inngå</FormLabel>
                  <div className="space-y-2">
                    {measures.length > 0 ? (
                      measures.map(measure => (
                        <Card 
                          key={measure.id}
                          className={`cursor-pointer transition-colors ${
                            selectedMeasures.includes(measure.id) ? 'border-primary' : ''
                          }`}
                          onClick={() => {
                            setSelectedMeasures(prev => 
                              prev.includes(measure.id) 
                                ? prev.filter(id => id !== measure.id)
                                : [...prev, measure.id]
                            )
                          }}
                        >
                          <CardContent className="p-4">
                            <p className="text-sm">{measure.description}</p>
                            <div className="mt-2 text-xs text-muted-foreground">
                              Type: {measure.type} • Status: {measure.status}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        Ingen tiltak funnet
                      </div>
                    )}
                  </div>
                </div>

                <DialogFooter>
                  <Button 
                    type="submit"
                    disabled={selectedMeasures.length === 0}
                  >
                    Registrer HMS-endring
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 