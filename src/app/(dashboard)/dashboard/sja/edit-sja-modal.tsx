"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { SJAWithRelations } from "./types"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  tittel: z.string().min(1, "Tittel er påkrevd"),
  arbeidssted: z.string().min(1, "Arbeidssted er påkrevd"),
  beskrivelse: z.string().min(1, "Beskrivelse er påkrevd"),
  startDato: z.string().min(1, "Startdato er påkrevd"),
  sluttDato: z.string().optional(),
  produkter: z.array(z.object({
    produktId: z.string(),
    mengde: z.string().optional()
  })).default([])
})

interface EditSJAModalProps {
  sja: SJAWithRelations
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (sja: SJAWithRelations) => void
}

interface Produkt {
  id: string
  navn: string
  produsent: string
}

export function EditSJAModal({ sja, open, onOpenChange, onEdit }: EditSJAModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [produkter, setProdukter] = useState<Produkt[]>([])
  const [isLoadingProdukter, setIsLoadingProdukter] = useState(false)
  const [valgteProdukter, setValgteProdukter] = useState<Array<{ produktId: string, mengde: string }>>(
    sja.produkter?.map(p => ({
      produktId: p.produktId,
      mengde: p.mengde || ""
    })) || []
  )

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tittel: sja.tittel,
      arbeidssted: sja.arbeidssted,
      beskrivelse: sja.beskrivelse,
      startDato: new Date(sja.startDato).toISOString().split('T')[0],
      sluttDato: sja.sluttDato ? new Date(sja.sluttDato).toISOString().split('T')[0] : "",
      produkter: valgteProdukter
    }
  })

  useEffect(() => {
    const hentProdukter = async () => {
      setIsLoadingProdukter(true)
      try {
        const response = await fetch('/api/stoffkartotek')
        if (response.ok) {
          const data = await response.json()
          setProdukter(Array.isArray(data) ? data : [])
        } else {
          toast.error('Kunne ikke hente produkter')
        }
      } catch (error) {
        console.error('Feil ved henting av produkter:', error)
        toast.error('Kunne ikke hente produkter')
      } finally {
        setIsLoadingProdukter(false)
      }
    }
    
    if (open) {
      hentProdukter()
    }
  }, [open])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/sja/${sja.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...values,
          startDato: new Date(values.startDato).toISOString(),
          sluttDato: values.sluttDato ? new Date(values.sluttDato).toISOString() : null,
          produkter: valgteProdukter
        })
      })

      if (!response.ok) {
        throw new Error('Kunne ikke oppdatere SJA')
      }

      const oppdatertSja = await response.json()
      onEdit(oppdatertSja)
      onOpenChange(false)
      toast.success('SJA oppdatert')
    } catch (error) {
      console.error('Feil ved oppdatering av SJA:', error)
      toast.error('Kunne ikke oppdatere SJA')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Rediger SJA</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-6 -mr-6">
          <Form {...form}>
            <form id="edit-sja-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 m-2">
              {/* Tittel */}
              <FormField
                control={form.control}
                name="tittel"
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

              {/* Arbeidssted */}
              <FormField
                control={form.control}
                name="arbeidssted"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Arbeidssted</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Beskrivelse */}
              <FormField
                control={form.control}
                name="beskrivelse"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beskrivelse</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="min-h-[100px]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Datoer */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDato"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Startdato</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sluttDato"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sluttdato</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Produktvelger */}
              <div className="space-y-4">
                <FormLabel>Produkter fra stoffkartotek</FormLabel>
                <div className="flex flex-col gap-4">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="justify-between"
                        disabled={isLoadingProdukter}
                      >
                        {isLoadingProdukter ? "Laster produkter..." : "Velg produkt"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                      <Command shouldFilter={false}>
                        <CommandInput placeholder="Søk etter produkt..." />
                        <CommandList>
                          <CommandEmpty>
                            {isLoadingProdukter ? "Laster..." : "Ingen produkter funnet."}
                          </CommandEmpty>
                          {produkter.length > 0 && (
                            <CommandGroup>
                              {produkter.map((produkt) => (
                                <CommandItem
                                  key={produkt.id}
                                  value={produkt.id}
                                  onSelect={() => {
                                    if (!valgteProdukter.some(p => p.produktId === produkt.id)) {
                                      setValgteProdukter(prev => [
                                        ...prev,
                                        { produktId: produkt.id, mengde: "" }
                                      ])
                                    }
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      valgteProdukter.some(p => p.produktId === produkt.id)
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {produkt.navn} - {produkt.produsent}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {/* Vis valgte produkter */}
                  <div className="space-y-2">
                    {valgteProdukter.map((valgtProdukt, index) => {
                      const produkt = produkter.find(p => p.id === valgtProdukt.produktId)
                      return (
                        <div key={index} className="flex items-center gap-2">
                          <Badge variant="secondary" className="flex-1">
                            {produkt?.navn}
                          </Badge>
                          <Input
                            placeholder="Mengde"
                            className="w-32"
                            value={valgtProdukt.mengde || ""}
                            onChange={(e) => {
                              const nyeProdukter = [...valgteProdukter]
                              nyeProdukter[index].mengde = e.target.value
                              setValgteProdukter(nyeProdukter)
                            }}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setValgteProdukter(prev => 
                                prev.filter((_, i) => i !== index)
                              )
                            }}
                          >
                            ×
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </div>

        <div className="flex justify-end space-x-2 pt-6 mt-6 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Avbryt
          </Button>
          <Button 
            type="submit"
            form="edit-sja-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Lagrer..." : "Lagre endringer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 