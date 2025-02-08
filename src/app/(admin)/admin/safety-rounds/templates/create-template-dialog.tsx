"use client"

import { useState } from "react"
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { SafetyRoundTemplate, CheckpointType } from "@/types/safety-rounds"
import { SectionBuilder } from "./section-builder"

const formSchema = z.object({
  name: z.string().min(1, "Navn er påkrevd"),
  description: z.string().optional(),
  industry: z.string().optional(),
  sections: z.array(z.object({
    title: z.string().min(1, "Tittel er påkrevd"),
    description: z.string().optional(),
    order: z.number(),
    checkpoints: z.array(z.object({
      question: z.string().min(1, "Spørsmål er påkrevd"),
      description: z.string().optional(),
      type: z.nativeEnum(CheckpointType),
      isRequired: z.boolean(),
      order: z.number(),
      options: z.any().optional()
    }))
  })).min(1, "Minst én seksjon er påkrevd")
})

interface CreateTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (template: SafetyRoundTemplate) => void
}

export function CreateTemplateDialog({
  open,
  onOpenChange,
  onSuccess
}: CreateTemplateDialogProps) {
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      industry: "",
      sections: []
    }
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/safety-round-templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) throw new Error("Kunne ikke opprette mal")

      const template = await response.json()
      onSuccess(template)
      onOpenChange(false)
      form.reset()
      toast.success("Mal opprettet")
    } catch (error) {
      console.error("Error creating template:", error)
      toast.error("Kunne ikke opprette mal")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Opprett ny vernerunde-mal</DialogTitle>
          <DialogDescription>
            Lag en ny mal for vernerunder med seksjoner og sjekkpunkter
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
                    <Input {...field} placeholder="F.eks. Standard vernerunde" />
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
                      placeholder="Beskriv formålet med denne malen"
                    />
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
                    <Input {...field} placeholder="F.eks. Bygg og anlegg" />
                  </FormControl>
                  <FormMessage />
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
                {loading ? "Oppretter..." : "Opprett mal"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 