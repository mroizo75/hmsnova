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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Download } from "lucide-react"
import { toast } from "sonner"

const formSchema = z.object({
  type: z.enum(["deviations", "risks", "all"]),
  format: z.enum(["excel", "pdf", "csv"]),
  dateRange: z.enum(["7d", "30d", "90d", "365d", "all"])
})

export function ExportDialog() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "all",
      format: "excel",
      dateRange: "30d"
    }
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await fetch("/api/reports/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      })

      if (!response.ok) throw new Error("Eksport feilet")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `rapport-${new Date().toISOString()}.${values.format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      
      toast.success("Rapport eksportert")
    } catch (error) {
      toast.error("Kunne ikke eksportere rapport")
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Eksporter Rapport
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eksporter Rapport</DialogTitle>
          <DialogDescription>
            Velg type data og format for eksporten
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Velg type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">Alt</SelectItem>
                      <SelectItem value="deviations">Avvik</SelectItem>
                      <SelectItem value="risks">Risikovurderinger</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Flere felter for format og datoområde */}
            
            <div className="flex justify-end">
              <Button type="submit">Eksporter</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 