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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { useState } from "react"

const formSchema = z.object({
  name: z.string().min(2, "Navn må være minst 2 tegn"),
  manufacturer: z.string().min(2, "Produsent må være minst 2 tegn"),
  description: z.string().optional(),
  location: z.string().optional(),
  hazardSymbols: z.array(z.string()),
  datasheet: z.any().optional()
})

interface Product {
  id: string
  name: string
  manufacturer: string
  description: string | null
  location: string | null
  hazardSymbols: {
    id: string
    name: string
    code: string
  }[]
  datasheet: {
    id: string
    url: string
    version: string
    uploadedAt: Date
  } | null
}

interface EditProductDialogProps {
  product: Product
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditProductDialog({ product, open, onOpenChange }: EditProductDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product.name,
      manufacturer: product.manufacturer,
      description: product.description || "",
      location: product.location || "",
      hazardSymbols: product.hazardSymbols.map(s => s.id)
    }
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)
      
      const formData = new FormData()
      Object.entries(values).forEach(([key, value]) => {
        if (key === 'hazardSymbols') {
          formData.append(key, JSON.stringify(value))
        } else if (key === 'datasheet' && value) {
          formData.append(key, value)
        } else {
          formData.append(key, value?.toString() || '')
        }
      })

      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        body: formData
      })

      if (!response.ok) throw new Error('Kunne ikke oppdatere produkt')
      
      onOpenChange(false)
      toast.success('Produkt oppdatert')
    } catch (error) {
      toast.error('Kunne ikke oppdatere produkt')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rediger produkt</DialogTitle>
          <DialogDescription>
            Oppdater informasjon om produktet
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Form fields identiske med add-product-dialog */}
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Lagrer..." : "Lagre endringer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 