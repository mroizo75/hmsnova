"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { SafetyRoundTemplate, CheckpointType } from "@/types/safety-rounds"
import { SectionBuilder } from "./section-builder"

const formSchema = z.object({
  name: z.string().min(1, "Navn er påkrevd"),
  description: z.string().optional(),
  industry: z.string().optional(),
  isActive: z.boolean(),
  sections: z.array(z.object({
    id: z.string().optional(),
    title: z.string().min(1, "Tittel er påkrevd"),
    description: z.string().optional(),
    order: z.number(),
    checkpoints: z.array(z.object({
      id: z.string().optional(),
      question: z.string().min(1, "Spørsmål er påkrevd"),
      description: z.string().optional(),
      type: z.nativeEnum(CheckpointType),
      isRequired: z.boolean(),
      order: z.number(),
      options: z.any().optional()
    }))
  })).min(1, "Minst én seksjon er påkrevd")
})

interface EditTemplateDialogProps {
  template: SafetyRoundTemplate
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (template: SafetyRoundTemplate) => void
}

export function EditTemplateDialog({
  template,
  open,
  onOpenChange,
  onSuccess
}: EditTemplateDialogProps) {
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: template.name,
      description: template.description || "",
      industry: template.industry || "",
      isActive: template.isActive,
      sections: template.sections.map(section => ({
        id: section.id,
        title: section.title,
        description: section.description || "",
        order: section.order,
        checkpoints: section.checkpoints.map(checkpoint => ({
          id: checkpoint.id,
          question: checkpoint.question,
          description: checkpoint.description || "",
          type: checkpoint.type,
          isRequired: checkpoint.isRequired,
          order: checkpoint.order,
          options: checkpoint.options
        }))
      }))
    }
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/safety-round-templates/${template.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) throw new Error("Kunne ikke oppdatere mal")

      const updatedTemplate = await response.json()
      onSuccess(updatedTemplate)
      onOpenChange(false)
      toast.success("Mal oppdatert")
    } catch (error) {
      console.error("Error updating template:", error)
      toast.error("Kunne ikke oppdatere mal")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rediger vernerunde-mal</DialogTitle>
          <DialogDescription>
            Oppdater malen for vernerunder
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Navn på mal</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bransje (valgfritt)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Aktiv</FormLabel>
                    <FormDescription>
                      Malen vil være tilgjengelig for bruk når den er aktiv
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Seksjoner</h3>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const sections = form.getValues("sections")
                    form.setValue("sections", [
                      ...sections,
                      {
                        title: "",
                        description: "",
                        order: sections.length,
                        checkpoints: []
                      }
                    ])
                  }}
                >
                  Legg til seksjon
                </Button>
              </div>

              <SectionBuilder 
                control={form.control} 
                setValue={form.setValue}
                watch={form.watch}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Avbryt
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Lagrer..." : "Lagre endringer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 