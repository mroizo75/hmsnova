"use client"

import { Button } from "@/components/ui/button"
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
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"

const formSchema = z.object({
  comment: z.string().min(10, "Kommentar må være minst 10 tegn")
})

interface Props {
  deviationId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => Promise<void>
  isClosing: boolean
}

export function CloseDeviationDialog({ 
  deviationId, 
  open, 
  onOpenChange,
  onSuccess,
  isClosing 
}: Props) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      comment: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await fetch(`/api/deviations/${deviationId}/close`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Kunne ikke lukke avvik")
      }

      toast.success("Avvik lukket")
      onOpenChange(false)
      await onSuccess()
    } catch (error) {
      console.error('Error closing deviation:', error)
      toast.error(error instanceof Error ? error.message : "Kunne ikke lukke avvik")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Lukk avvik</DialogTitle>
          <DialogDescription>
            Skriv en kommentar om hvorfor avviket lukkes.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kommentar</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Skriv en kommentar..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Avbryt
              </Button>
              <Button type="submit" disabled={isClosing}>
                {isClosing ? "Lukker..." : "Lukk avvik"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 