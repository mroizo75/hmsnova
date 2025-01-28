"use client"

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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Editor } from "@/components/editor"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import React, { useState } from "react"

const formSchema = z.object({
  title: z.string().min(2, "Tittel må være minst 2 tegn"),
  content: z.string().min(1, "Innhold er påkrevd"),
})

interface AddSectionDialogProps {
  handbookId: string
  parentId?: string
  trigger?: React.ReactNode
}

export function AddSectionDialog({ handbookId, parentId, trigger }: AddSectionDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await fetch('/api/hms-handbook/sections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          handbookId,
          parentId,
          title: values.title,
          content: values.content,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message)
      }

      toast.success("Seksjon opprettet")
      setOpen(false)
      form.reset()
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error 
          ? error.message 
          : "Kunne ikke opprette seksjon"
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Legg til seksjon
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl h-[90vh] p-0 flex flex-col">
        <div className="p-6 pb-0">
          <DialogHeader>
            <DialogTitle>Legg til seksjon</DialogTitle>
            <DialogDescription>
              Legg til en ny seksjon i HMS-håndboken.
            </DialogDescription>
          </DialogHeader>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden p-6 pt-4">
            <div className="flex-1 overflow-y-auto pr-2">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tittel</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Innhold</FormLabel>
                      <FormControl>
                        <Editor 
                          value={field.value} 
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t mt-4">
              <Button type="submit">Lagre</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 