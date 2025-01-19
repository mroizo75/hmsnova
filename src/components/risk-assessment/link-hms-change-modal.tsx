'use client'

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface Hazard {
  id: string
  title: string
  description: string
  riskLevel: string
}

const linkHMSChangeSchema = z.object({
  hazardIds: z.array(z.string()).min(1, "Velg minst én fare"),
  changeId: z.string()
})

interface LinkHMSChangeModalProps {
  isOpen: boolean
  onClose: () => void
  riskAssessmentId: string
  hazards: Array<{
    id: string
    description: string
    riskLevel: number
  }>
  changes: Array<{
    id: string
    title: string
    status: string
  }>
}

export function LinkHMSChangeModal({
  isOpen,
  onClose,
  riskAssessmentId,
  hazards,
  changes
}: LinkHMSChangeModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof linkHMSChangeSchema>>({
    resolver: zodResolver(linkHMSChangeSchema),
    defaultValues: {
      hazardIds: [],
      changeId: ""
    }
  })

  async function onSubmit(values: z.infer<typeof linkHMSChangeSchema>) {
    try {
      setIsSubmitting(true)
      
      const response = await fetch(`/api/risk-assessments/${riskAssessmentId}/link-change`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error("Kunne ikke koble til HMS-endring")
      }

      toast.success("Farer koblet til HMS-endring")
      onClose()
    } catch (error) {
      console.error("Error linking HMS change:", error)
      toast.error("Kunne ikke koble til HMS-endring")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Koble farer til HMS-endring</DialogTitle>
          <DialogDescription>
            Velg hvilke farer som skal knyttes til HMS-endringen
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="hazardIds"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Farer</FormLabel>
                  </div>
                  <div className="space-y-2">
                    {hazards.map((hazard) => (
                      <FormField
                        key={hazard.id}
                        control={form.control}
                        name="hazardIds"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={hazard.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(hazard.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, hazard.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== hazard.id
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="font-normal">
                                  {hazard.description}
                                </FormLabel>
                                <p className="text-sm text-muted-foreground">
                                  Risikonivå: {hazard.riskLevel}
                                </p>
                              </div>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="changeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>HMS-endring</FormLabel>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...field}
                  >
                    <option value="">Velg HMS-endring</option>
                    {changes.map((change) => (
                      <option key={change.id} value={change.id}>
                        {change.title} ({change.status})
                      </option>
                    ))}
                  </select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Avbryt
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Koble til endring
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 