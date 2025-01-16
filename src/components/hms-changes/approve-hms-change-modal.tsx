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
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const approveSchema = z.object({
  comment: z.string().min(10, "Kommentar må være minst 10 tegn"),
})

interface ApproveModalProps {
  isOpen: boolean
  onClose: () => void
  changeId: string
}

export function ApproveHMSChangeModal({
  isOpen,
  onClose,
  changeId
}: ApproveModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof approveSchema>>({
    resolver: zodResolver(approveSchema),
    defaultValues: {
      comment: ""
    }
  })

  async function onSubmit(values: z.infer<typeof approveSchema>) {
    try {
      setIsSubmitting(true)
      
      const response = await fetch(`/api/hms-changes/${changeId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error("Kunne ikke godkjenne endringen")
      }

      toast.success("HMS-endring godkjent")
      onClose()
    } catch (error) {
      console.error("Error approving change:", error)
      toast.error("Kunne ikke godkjenne endringen")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Godkjenn HMS-endring</DialogTitle>
          <DialogDescription>
            Legg til en kommentar for å godkjenne endringen
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Godkjenningskommentar</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Skriv en kommentar..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
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
                Godkjenn
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 