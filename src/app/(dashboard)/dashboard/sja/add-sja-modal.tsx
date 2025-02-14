"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
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
import { Plus, Trash } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const formSchema = z.object({
  tittel: z.string().min(1, "Tittel er påkrevd"),
  arbeidssted: z.string().min(1, "Arbeidssted er påkrevd"),
  beskrivelse: z.string().min(1, "Beskrivelse er påkrevd"),
  startDato: z.string(),
  sluttDato: z.string(),
  deltakere: z.string().min(1, "Deltakere er påkrevd"),
  produkter: z.array(z.object({
    id: z.string(),
    antall: z.string()
  })).optional(),
  lagreSomMal: z.boolean(),
  attachments: z.any().optional(),
  risikoer: z.array(z.object({
    aktivitet: z.string(),
    fare: z.string(),
    konsekvens: z.string(),
    sannsynlighet: z.number().min(1).max(5),
    alvorlighet: z.number().min(1).max(5),
    risikoVerdi: z.number()
  })),
  tiltak: z.array(z.object({
    beskrivelse: z.string(),
    ansvarlig: z.string(),
    status: z.string(),
    frist: z.string().nullable()
  }))
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
      produkter: [],
      lagreSomMal: false,
      risikoer: [],
      tiltak: []
    }
  })

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      try {
        console.log('=== STARTER SJA OPPRETTELSE ===')
        console.log('Form verdier:', values)
        console.log('Antall bilder:', bilder.length)

        // Last opp bilder først
        let bildeUrls: string[] = []
        if (bilder.length > 0) {
          console.log('Starter bilde-opplasting...')
          const formData = new FormData()
          bilder.forEach((bilde) => {
            formData.append('files', bilde)
            console.log('Legger til bilde:', bilde.name)
          })

          // Først oppretter vi SJA uten bilder
          console.log('Oppretter SJA...')
          const sjaResponse = await fetch('/api/sja', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              tittel: values.tittel,
              arbeidssted: values.arbeidssted,
              beskrivelse: values.beskrivelse,
              startDato: new Date(values.startDato).toISOString(),
              sluttDato: values.sluttDato ? new Date(values.sluttDato).toISOString() : null,
              status: "UTKAST",
              deltakere: values.deltakere,
              produkter: valgteProdukter.length > 0 ? {
                create: valgteProdukter.map(p => ({
                  produktId: p.produktId,
                  mengde: p.mengde
                }))
              } : undefined,
              risikoer: {
                create: values.risikoer?.map(r => ({
                  aktivitet: r.aktivitet,
                  fare: r.fare,
                  konsekvens: r.konsekvens || '',
                  sannsynlighet: r.sannsynlighet,
                  alvorlighet: r.alvorlighet,
                  risikoVerdi: r.risikoVerdi
                })) || []
              },
              tiltak: {
                create: values.tiltak?.map(t => ({
                  beskrivelse: t.beskrivelse,
                  ansvarlig: t.ansvarlig,
                  status: t.status,
                  frist: t.frist
                })) || []
              }
            })
          })

          console.log('SJA respons status:', sjaResponse.status)
          if (!sjaResponse.ok) {
            const errorData = await sjaResponse.json()
            console.error('SJA feilmelding:', errorData)
            throw new Error('Kunne ikke opprette SJA')
          }

          const sja = await sjaResponse.json()
          console.log('SJA opprettet:', sja)

          // Så laster vi opp bildene til den opprettede SJA-en
          console.log('Laster opp bilder til SJA:', sja.id)
          const bildeUrl = `/api/sja/${encodeURIComponent(sja.id)}/bilder`
          console.log('Bruker bilde-URL:', bildeUrl)
          
          const bildeResponse = await fetch(bildeUrl, {
            method: 'POST',
            body: formData
          })

          console.log('Bilde respons status:', bildeResponse.status)
          if (!bildeResponse.ok) {
            const errorData = await bildeResponse.json()
            console.error('Bilde feilmelding:', errorData)
            throw new Error('Kunne ikke laste opp bilder')
          }

          bildeUrls = await bildeResponse.json()
          console.log('Bilder lastet opp:', bildeUrls)
          return sja
        }

        // Hvis ingen bilder, opprett bare SJA
        console.log('Ingen bilder å laste opp, oppretter bare SJA')
        const response = await fetch('/api/sja', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            tittel: values.tittel,
            arbeidssted: values.arbeidssted,
            beskrivelse: values.beskrivelse,
            startDato: new Date(values.startDato).toISOString(),
            sluttDato: values.sluttDato ? new Date(values.sluttDato).toISOString() : null,
            status: "UTKAST",
            deltakere: values.deltakere,
            produkter: valgteProdukter.length > 0 ? {
              create: valgteProdukter.map(p => ({
                produktId: p.produktId,
                mengde: p.mengde
              }))
            } : undefined,
            risikoer: {
              create: values.risikoer?.map(r => ({
                aktivitet: r.aktivitet,
                fare: r.fare,
                konsekvens: r.konsekvens || '',
                sannsynlighet: r.sannsynlighet,
                alvorlighet: r.alvorlighet,
                risikoVerdi: r.risikoVerdi
              })) || []
            },
            tiltak: {
              create: values.tiltak?.map(t => ({
                beskrivelse: t.beskrivelse,
                ansvarlig: t.ansvarlig,
                status: t.status,
                frist: t.frist
              })) || []
            }
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error('SJA feilmelding:', errorData)
          throw new Error('Kunne ikke opprette SJA')
        }

        const sja = await response.json()
        console.log('SJA opprettet uten bilder:', sja)
        return sja

      } catch (error) {
        console.error('Feil ved opprettelse av SJA:', error)
        throw error
      }
    },
    onSuccess: (data) => {
      console.log('SJA opprettet vellykket:', data)
      toast.success('SJA opprettet')
      onOpenChange(false)
      form.reset()
      setBilder([])
      setValgteProdukter([])
      if (onAdd) onAdd(data)
    },
    onError: (error) => {
      console.error('Feil ved oppretting av SJA:', error)
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
      startDato: new Date().toISOString().split('T')[0],
      sluttDato: new Date().toISOString().split('T')[0],
      produkter: [],
      lagreSomMal: false,
      risikoer: [],
      tiltak: []
    })
  }

  const { fields: risikoFields, append: appendRisiko, remove: removeRisiko } = useFieldArray({
    control: form.control,
    name: "risikoer"
  })

  const { fields: tiltakFields, append: appendTiltak, remove: removeTiltak } = useFieldArray({
    control: form.control,
    name: "tiltak"
  })

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
                </div>

                {/* Datoer side ved side */}
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
                        <FormLabel>Beskrivelse</FormLabel>
                        <FormControl>
                          <Textarea {...field} className="min-h-[100px]" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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

                {/* Risikoer */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <FormLabel>Risikoer</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendRisiko({ 
                        aktivitet: "", 
                        fare: "", 
                        konsekvens: "",
                        sannsynlighet: 1,
                        alvorlighet: 1,
                        risikoVerdi: 1
                      })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Legg til risiko
                    </Button>
                  </div>
                  
                  {risikoFields.map((field: any, index: number) => (
                    <div key={field.id} className="border p-4 rounded-lg space-y-4">
                      <div className="flex justify-between">
                        <h4>Risiko {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRisiko(index)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`risikoer.${index}.aktivitet`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Aktivitet</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name={`risikoer.${index}.fare`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fare</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name={`risikoer.${index}.sannsynlighet`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sannsynlighet (1-5)</FormLabel>
                              <Select 
                                onValueChange={(value) => field.onChange(parseInt(value))}
                                value={field.value.toString()}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {[1,2,3,4,5].map(num => (
                                    <SelectItem key={num} value={num.toString()}>
                                      {num}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name={`risikoer.${index}.alvorlighet`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Alvorlighet (1-5)</FormLabel>
                              <Select 
                                onValueChange={(value) => field.onChange(parseInt(value))}
                                value={field.value.toString()}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {[1,2,3,4,5].map(num => (
                                    <SelectItem key={num} value={num.toString()}>
                                      {num}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tiltak */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <FormLabel>Tiltak</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendTiltak({ 
                        beskrivelse: "", 
                        ansvarlig: "", 
                        status: "PLANLAGT",
                        frist: null 
                      })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Legg til tiltak
                    </Button>
                  </div>
                  
                  {tiltakFields.map((field: any, index: number) => (
                    <div key={field.id} className="border p-4 rounded-lg space-y-4">
                      <div className="flex justify-between">
                        <h4>Tiltak {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTiltak(index)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <FormField
                        control={form.control}
                        name={`tiltak.${index}.beskrivelse`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Beskrivelse</FormLabel>
                            <FormControl>
                              <Textarea {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`tiltak.${index}.ansvarlig`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ansvarlig</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name={`tiltak.${index}.frist`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Frist</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} value={field.value || ""} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
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