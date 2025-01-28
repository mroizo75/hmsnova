"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { SJAWithRelations } from "./types"
import { useDropzone } from "react-dropzone"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Combobox } from "@/components/ui/combobox"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { NotificationType } from "@prisma/client"
import { Checkbox } from "@/components/ui/checkbox"
import { MalVelger } from "./mal-velger"

const formSchema = z.object({
  tittel: z.string().min(3, "Tittel må være minst 3 tegn"),
  arbeidssted: z.string().min(3, "Arbeidssted må være minst 3 tegn"),
  beskrivelse: z.string().min(10, "Beskrivelse må være minst 10 tegn"),
  startDato: z.string(),
  sluttDato: z.string(),
  deltakere: z.string(),
  identifiedRisks: z.string(),
  riskMitigation: z.string(),
  responsiblePerson: z.string(),
  comments: z.string().optional(),
  produkter: z.array(z.object({
    id: z.string(),
    antall: z.string()
  })).optional(),
  lagreSomMal: z.boolean().default(false)
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
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bilder, setBilder] = useState<File[]>([])
  const [produkter, setProdukter] = useState<Produkt[]>([])
  const [isLoadingProdukter, setIsLoadingProdukter] = useState(false)
  const [valgteProdukter, setValgteProdukter] = useState<Array<{ produktId: string, mengde: string }>>([])
  const [maler, setMaler] = useState<any[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tittel: "",
      arbeidssted: "",
      beskrivelse: "",
      startDato: new Date().toISOString().split('T')[0],
      sluttDato: new Date().toISOString().split('T')[0],
      deltakere: "",
      identifiedRisks: "",
      riskMitigation: "",
      responsiblePerson: "",
      comments: "",
      produkter: [],
      lagreSomMal: false
    }
  })

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      console.log('=== START SJA MUTATION ===')
      console.log('Raw form values:', values)
      console.log('valgteProdukter:', valgteProdukter)

      const formData = {
        ...values,
        startDato: new Date(values.startDato).toISOString(),
        sluttDato: values.sluttDato ? new Date(values.sluttDato).toISOString() : null,
        produkter: valgteProdukter
      }
      console.log('Processed form data:', formData)

      const response = await fetch('/api/sja', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      console.log('Server response raw:', data)
      console.log('Server response data:', data.data)
      console.log('Server response success:', data.success)

      if (!response.ok) {
        throw new Error(data.error || 'Kunne ikke opprette SJA')
      }

      return data
    },
    onSuccess: (data) => {
      console.log('=== MUTATION SUCCESS ===')
      console.log('Full success data:', data)
      
      if (!data || !data.data) {
        console.error('Ugyldig respons data:', data)
        toast.error('Uventet respons fra server')
        return
      }

      // Lukk modal og reset form
      onOpenChange(false)
      form.reset()
      setBilder([])
      setValgteProdukter([])

      // Vis suksessmelding
      toast.success('SJA opprettet')

      // Kjør onAdd callback med den nye dataen
      if (onAdd) {
        onAdd(data.data)
      }
    },
    onError: (error) => {
      console.error('=== MUTATION ERROR ===')
      console.error('Full error:', error)
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack available')
      toast.error('Kunne ikke opprette SJA')
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

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log('Form submitted, calling mutate...')
    mutate(values)
  }

  useEffect(() => {
    if (!open) {
      form.reset()
      setBilder([])
      setValgteProdukter([])
    }
  }, [open, form])

  const handleVelgMal = (mal: any) => {
    form.reset({
      tittel: mal.tittel,
      beskrivelse: mal.beskrivelse,
      arbeidssted: mal.arbeidssted,
      deltakere: mal.deltakere,
      responsiblePerson: mal.ansvarlig,
      identifiedRisks: mal.arbeidsoppgaver,
      riskMitigation: mal.tiltak.map((t: any) => t.beskrivelse).join('\n'),
      startDato: new Date().toISOString().split('T')[0],
      sluttDato: new Date().toISOString().split('T')[0],
      comments: "",
      produkter: [],
      lagreSomMal: false
    })
  }

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
                          <Input 
                            type="date" 
                            {...field} 
                            value={field.value || ''}
                          />
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
                            <Input 
                              type="date" 
                              {...field} 
                              value={field.value || ''}
                            />
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

                {/* Mal-checkbox */}
                <FormField
                  control={form.control}
                  name="lagreSomMal"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Lagre som mal
                        </FormLabel>
                        <FormDescription>
                          Dette vil lagre SJA-en som en mal for senere bruk
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>

          <div className="flex justify-between pt-6 mt-6 border-t">
            <MalVelger onVelgMal={handleVelgMal} />
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
                disabled={isPending}
              >
                {isPending ? "Lagrer..." : "Lagre"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 