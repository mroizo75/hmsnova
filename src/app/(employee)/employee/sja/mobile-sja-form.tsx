"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { useDropzone } from "react-dropzone"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Combobox } from "@/components/ui/combobox"
import { Plus, Trash, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MalVelger } from "@/app/(dashboard)/dashboard/sja/mal-velger"
import { Checkbox } from "@/components/ui/checkbox"

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

export function MobileSJAForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bilder, setBilder] = useState<File[]>([])
  const [produkter, setProdukter] = useState<Array<{ id: string; produktnavn: string; produsent: string }>>([])
  const [valgteProdukter, setValgteProdukter] = useState<Array<{ produktId: string; mengde: string }>>([])

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

  const { fields: risikoFields, append: appendRisiko, remove: removeRisiko } = useFieldArray({
    control: form.control,
    name: "risikoer"
  })

  const { fields: tiltakFields, append: appendTiltak, remove: removeTiltak } = useFieldArray({
    control: form.control,
    name: "tiltak"
  })

  useEffect(() => {
    async function hentProdukter() {
      try {
        const response = await fetch('/api/stoffkartotek')
        if (!response.ok) throw new Error('Kunne ikke hente produkter')
        const data = await response.json()
        setProdukter(data)
      } catch (error) {
        console.error('Feil ved henting av produkter:', error)
        toast.error('Kunne ikke hente produkter')
      }
    }
    hentProdukter()
  }, [])

  const onDrop = (acceptedFiles: File[]) => {
    setBilder(prev => [...prev, ...acceptedFiles])
    toast.success('Bilder lagt til')
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] }
  })

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    try {
      // Opprett SJA med samme format som i add-sja-modal
      const sjaData = {
        tittel: values.tittel,
        arbeidssted: values.arbeidssted,
        beskrivelse: values.beskrivelse,
        startDato: new Date(values.startDato).toISOString(),
        sluttDato: values.sluttDato ? new Date(values.sluttDato).toISOString() : null,
        status: "UTKAST",
        deltakere: values.deltakere,
        lagreSomMal: values.lagreSomMal,
        produkter: valgteProdukter.length > 0 ? {
          create: valgteProdukter.map(p => ({
            produktId: p.produktId,
            mengde: p.mengde
          }))
        } : undefined,
        risikoer: {
          create: values.risikoer.map(r => ({
            aktivitet: r.aktivitet,
            fare: r.fare,
            konsekvens: r.konsekvens || '',
            sannsynlighet: r.sannsynlighet,
            alvorlighet: r.alvorlighet,
            risikoVerdi: r.risikoVerdi
          }))
        },
        tiltak: {
          create: values.tiltak.map(t => ({
            beskrivelse: t.beskrivelse,
            ansvarlig: t.ansvarlig,
            status: t.status,
            frist: t.frist
          }))
        }
      }

      // Opprett SJA
      const sjaResponse = await fetch('/api/sja', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sjaData)
      })

      if (!sjaResponse.ok) throw new Error('Kunne ikke opprette SJA')
      const sja = await sjaResponse.json()

      // Hvis lagre som mal er valgt, opprett mal
      if (values.lagreSomMal) {
        await fetch('/api/sja/mal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...sjaData,
            sjaId: sja.id
          })
        })
      }

      // Last opp bilder hvis det finnes
      if (bilder.length > 0) {
        const formData = new FormData()
        bilder.forEach(bilde => formData.append('files', bilde))

        try {
          // Last opp bildene
          const bildeResponse = await fetch(`/api/sja/${sja.id}/bilder`, {
            method: 'POST',
            body: formData
          })

          if (!bildeResponse.ok) throw new Error('Kunne ikke laste opp bilder')
          
          // Hent bilde-URLene fra responsen
          const bildeData = await bildeResponse.json()
          
          // Oppdater SJA med bildene
          const updateResponse = await fetch(`/api/sja/${sja.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              bilder: {
                create: bildeData.map((bilde: string) => ({
                  url: bilde,
                  beskrivelse: ''
                }))
              }
            })
          })

          if (!updateResponse.ok) throw new Error('Kunne ikke oppdatere SJA med bilder')
        } catch (error) {
          console.error('Feil ved bildehåndtering:', error)
          toast.error('Kunne ikke laste opp alle bilder')
        }
      }

      toast.success('SJA opprettet')
      router.push('/employee-dashboard')
    } catch (error) {
      console.error('Feil ved opprettelse av SJA:', error)
      toast.error('Kunne ikke opprette SJA')
    } finally {
      setIsSubmitting(false)
    }
  }

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

  return (
    <Card className="p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Grunnleggende informasjon */}
          <div className="space-y-4">
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

            <FormField
              control={form.control}
              name="beskrivelse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beskrivelse</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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

            {risikoFields.map((field, index) => (
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

                <div className="space-y-4">
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

                  <div className="grid grid-cols-2 gap-4">
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

            {tiltakFields.map((field, index) => (
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

          {/* Produkter */}
          <div className="space-y-4">
            <FormLabel>Produkter fra stoffkartotek</FormLabel>
            <Combobox
              options={produkter.map(p => ({
                id: p.id,
                label: `${p.produktnavn} - ${p.produsent}`
              }))}
              placeholder="Velg produkt"
              onSelect={(value) => {
                if (value && !valgteProdukter.find(p => p.produktId === value)) {
                  setValgteProdukter([...valgteProdukter, { produktId: value, mengde: '' }])
                }
              }}
            />

            <div className="space-y-2">
              {valgteProdukter.map((produkt, index) => {
                const produktInfo = produkter.find(p => p.id === produkt.produktId)
                return (
                  <div key={index} className="flex items-center gap-2">
                    <Badge variant="secondary" className="flex-1">
                      {produktInfo?.produktnavn}
                    </Badge>
                    <Input
                      placeholder="Mengde"
                      value={produkt.mengde}
                      onChange={(e) => {
                        const nyeProdukter = [...valgteProdukter]
                        nyeProdukter[index].mengde = e.target.value
                        setValgteProdukter(nyeProdukter)
                      }}
                      className="w-24"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setValgteProdukter(valgteProdukter.filter((_, i) => i !== index))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Bilder */}
          <div className="space-y-4">
            <FormLabel>Bilder</FormLabel>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer 
                ${isDragActive ? 'border-primary' : 'border-gray-300'}`}
            >
              <input {...getInputProps()} />
              <p>Dra og slipp bilder her, eller klikk for å velge</p>
            </div>

            {bilder.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {bilder.map((bilde, index) => (
                  <div key={index} className="relative">
                    <Image
                      src={URL.createObjectURL(bilde)}
                      alt={`Bilde ${index + 1}`}
                      width={200}
                      height={200}
                      className="rounded-lg object-cover w-full aspect-square"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => setBilder(bilder.filter((_, i) => i !== index))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Legg til Lagre som mal checkbox før knappene */}
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

          {/* Knapper */}
          <div className="flex justify-between pt-6 mt-6 border-t">
            <MalVelger onVelgMal={handleVelgMal} />
            <div className="space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Avbryt
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Lagrer..." : "Lagre"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </Card>
  )
} 