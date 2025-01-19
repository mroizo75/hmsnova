"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { SJAWithRelations } from "./types"
import { useDropzone } from "react-dropzone"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Combobox } from "@/components/ui/combobox"

const formSchema = z.object({
  tittel: z.string().min(1, "Tittel er påkrevd"),
  arbeidssted: z.string().min(1, "Arbeidssted er påkrevd"),
  beskrivelse: z.string().min(1, "Beskrivelse er påkrevd"),
  startDato: z.string().min(1, "Startdato er påkrevd"),
  sluttDato: z.string().optional(),
  deltakere: z.string().min(1, "Deltakere er påkrevd"),
  identifiedRisks: z.string().min(1, "Identifiserte risikoer er påkrevd"),
  riskMitigation: z.string().min(1, "Tiltak er påkrevd"),
  responsiblePerson: z.string().min(1, "Ansvarlig person er påkrevd"),
  comments: z.string().optional(),
  produkter: z.array(z.object({
    produktId: z.string(),
    mengde: z.string().optional()
  })).default([])
})

interface AddSJAModalProps {
  open: boolean
  onOpenChange: (open: boolean | undefined) => void
  onAdd: (sja: SJAWithRelations | undefined) => void
}

interface Produkt {
  id: string
  produktnavn: string
  produsent: string
}

export function AddSJAModal({ open, onOpenChange, onAdd }: AddSJAModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bilder, setBilder] = useState<File[]>([])
  const [visMalModal, setVisMalModal] = useState(false)
  const [malNavn, setMalNavn] = useState("")
  const [produkter, setProdukter] = useState<Produkt[]>([])
  const [isLoadingProdukter, setIsLoadingProdukter] = useState(false)
  const [valgteProdukter, setValgteProdukter] = useState<Array<{ produktId: string, mengde: string }>>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tittel: "",
      arbeidssted: "",
      beskrivelse: "",
      startDato: "",
      sluttDato: "",
      deltakere: "",
      identifiedRisks: "",
      riskMitigation: "",
      responsiblePerson: "",
      comments: "",
      produkter: []
    }
  })

  useEffect(() => {
    const hentProdukter = async () => {
      setIsLoadingProdukter(true)
      try {
        const response = await fetch('/api/stoffkartotek')
        if (response.ok) {
          const data = await response.json()
          console.log('Mottatte produkter:', data)
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

  const onDrop = async (acceptedFiles: File[]) => {
    setBilder(prevBilder => [...prevBilder, ...acceptedFiles])
    toast.success('Bilder lagt til')
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    }
  })

  const lagreSomMal = async () => {
    if (!malNavn) {
      toast.error("Vennligst gi malen et navn")
      return
    }

    try {
      const response = await fetch('/api/sja/mal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          navn: malNavn,
          ...form.getValues()
        }),
      })

      if (!response.ok) {
        throw new Error('Kunne ikke lagre mal')
      }

      toast.success('Mal lagret!')
      setVisMalModal(false)
      setMalNavn("")
    } catch (error) {
      console.error('Feil ved lagring av mal:', error)
      toast.error('Kunne ikke lagre mal')
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    try {
      const formData = {
        ...values,
        startDato: new Date(values.startDato).toISOString(),
        sluttDato: values.sluttDato ? new Date(values.sluttDato).toISOString() : null,
        produkter: valgteProdukter
      }

      console.log('Sending data:', formData)

      const response = await fetch('/api/sja', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Server response:', errorData)
        throw new Error(errorData.error || 'Kunne ikke opprette SJA')
      }

      const sja = await response.json()

      if (bilder.length > 0) {
        const bildeLaster = bilder.map(async (file) => {
          const formData = new FormData()
          formData.append('file', file)
          
          const bildeResponse = await fetch(`/api/sja/${sja.id}/vedlegg`, {
            method: 'POST',
            body: formData
          })

          if (!bildeResponse.ok) {
            throw new Error('Kunne ikke laste opp bilde')
          }

          return await bildeResponse.json()
        })

        const opplastededBilder = await Promise.all(bildeLaster)
        sja.vedlegg = opplastededBilder
      }

      onAdd(sja)
      onOpenChange(false)
      form.reset()
      setBilder([])
      toast.success('SJA opprettet')
    } catch (error) {
      console.error('Feil ved opprettelse av SJA:', error)
      toast.error('Kunne ikke opprette SJA')
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (!open) {
      form.reset()
      setBilder([])
      setValgteProdukter([])
    }
  }, [open, form])

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Opprett ny SJA</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-6 -mr-6">
            <Form {...form}>
              <form id="sja-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 m-2">
                {/* Øverste rad med grunnleggende informasjon */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tittel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jobbtittel</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="arbeidssted"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jobblokasjon</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Andre rad med dato */}
                <div className="grid grid-cols-1 gap-4">
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
                        <FormLabel>Slutt dato</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Deltakere */}
                <FormField
                  control={form.control}
                  name="deltakere"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deltakere</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Store tekstfelt i full bredde */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="beskrivelse"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jobbeskrivelse</FormLabel>
                        <FormControl>
                          <Textarea {...field} className="min-h-[100px]" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="identifiedRisks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Identifiserte risikoer</FormLabel>
                        <FormControl>
                          <Textarea {...field} className="min-h-[100px]" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="riskMitigation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tiltak for å redusere risiko</FormLabel>
                        <FormControl>
                          <Textarea {...field} className="min-h-[100px]" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Nederste rad med ansvarlig person */}
                <FormField
                  control={form.control}
                  name="responsiblePerson"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ansvarlig person</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Kommentarer */}
                <FormField
                  control={form.control}
                  name="comments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kommentarer</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="min-h-[80px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Bildeopplasting */}
                <div className="space-y-4">
                  <FormLabel>Bilder</FormLabel>
                  <div {...getRootProps()} className="border-2 border-dashed border-gray-300 p-4 text-center cursor-pointer rounded-md hover:border-gray-400 transition-colors">
                    <input {...getInputProps()} />
                    {isDragActive ? (
                      <p>Slipp bildene her ...</p>
                    ) : (
                      <p>Dra og slipp bilder her, eller klikk for å velge filer</p>
                    )}
                  </div>
                  
                  {/* Bildegalleri */}
                  {bilder.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      {bilder.map((file, index) => (
                        <div key={index} className="relative group">
                          <Image 
                            src={URL.createObjectURL(file)} 
                            alt={`Bilde ${index + 1}`} 
                            width={200} 
                            height={200} 
                            className="rounded-md object-cover w-full h-40"
                          />
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              setBilder(prevBilder => prevBilder.filter((_, i) => i !== index))
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Produktvelger */}
                <div className="space-y-4">
                  <FormLabel>Produkter fra stoffkartotek</FormLabel>
                  <div className="flex flex-col gap-4">
                    <Combobox
                      options={produkter.map(p => ({
                        id: p.id,
                        label: `${p.produktnavn} - ${p.produsent}`
                      }))}
                      onSelect={(value) => {
                        const produkt = produkter.find(p => p.id === value)
                        if (produkt && !valgteProdukter.some(p => p.produktId === produkt.id)) {
                          setValgteProdukter(prev => [...prev, { 
                            produktId: produkt.id, 
                            mengde: "" 
                          }])
                        }
                      }}
                      placeholder="Velg produkt"
                      isLoading={isLoadingProdukter}
                    />

                    {/* Vis valgte produkter */}
                    <div className="space-y-2">
                      {valgteProdukter.map((valgtProdukt, index) => {
                        const produkt = produkter.find(p => p.id === valgtProdukt.produktId)
                        return (
                          <div key={index} className="flex items-center gap-2">
                            <Badge variant="secondary" className="flex-1">
                              {produkt?.produktnavn} - {produkt?.produsent}
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

          <div className="flex justify-between pt-6 mt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setVisMalModal(true)}
            >
              Lagre som mal
            </Button>
            <div className="space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Avbryt
              </Button>
              <Button 
                type="submit" 
                form="sja-form" 
                disabled={isSubmitting}
                onClick={() => form.handleSubmit(onSubmit)()}
              >
                {isSubmitting ? "Lagrer..." : "Lagre"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mal-dialog */}
      <Dialog open={visMalModal} onOpenChange={setVisMalModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lagre som mal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <FormLabel>Navn på mal</FormLabel>
              <Input
                value={malNavn}
                onChange={(e) => setMalNavn(e.target.value)}
                placeholder="Skriv inn navn på malen"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVisMalModal(false)}>
              Avbryt
            </Button>
            <Button onClick={lagreSomMal}>
              Lagre mal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 