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
import { Plus, Trash, X, MapPin } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MalVelger } from "@/app/(dashboard)/dashboard/sja/mal-velger"
import { Checkbox } from "@/components/ui/checkbox"
import { LocationDialog } from "@/app/(dashboard)/dashboard/sja/location-dialog"

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
  })),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  locationName: z.string().optional()
})

// Beskrivelse av sannsynlighetsskala
const sannsynlighetSkala = [
  { verdi: 1, tekst: "Usannsynlig" },
  { verdi: 2, tekst: "Mindre sannsynlig" },
  { verdi: 3, tekst: "Sannsynlig" },
  { verdi: 4, tekst: "Meget sannsynlig" },
  { verdi: 5, tekst: "Svært sannsynlig" }
]

// Beskrivelse av alvorlighetsskala
const alvorlighetSkala = [
  { verdi: 1, tekst: "Ubetydelig" },
  { verdi: 2, tekst: "Mindre alvorlig" },
  { verdi: 3, tekst: "Alvorlig" },
  { verdi: 4, tekst: "Meget alvorlig" },
  { verdi: 5, tekst: "Svært alvorlig" }
]

export function MobileSJAForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bilder, setBilder] = useState<File[]>([])
  const [produkter, setProdukter] = useState<Array<{ id: string; produktnavn: string; produsent: string }>>([])
  const [valgteProdukter, setValgteProdukter] = useState<Array<{ produktId: string; mengde: string }>>([])
  const [latitude, setLatitude] = useState<number | undefined>(undefined)
  const [longitude, setLongitude] = useState<number | undefined>(undefined)
  const [locationName, setLocationName] = useState<string | undefined>(undefined)
  const [includeWeather, setIncludeWeather] = useState(false)
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false)

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
      tiltak: [],
      latitude: undefined,
      longitude: undefined,
      locationName: undefined
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

  const handleLocationUpdate = (locationData: { latitude: number, longitude: number, name: string }) => {
    console.log('handleLocationUpdate kalt med:', locationData);
    
    // Bruk setTimeout for å unngå setState under rendering
    setTimeout(() => {
      console.log('Oppdaterer lokasjon lokalt i skjemaet (ingen API-kall):', locationData);
      
      // Aktiver værdata-visning automatisk hvis ikke allerede aktivert
      if (!includeWeather) {
        setIncludeWeather(true);
      }
      
      // Bare oppdater lokale state-verdier, ikke lagre SJA ennå
      setLatitude(locationData.latitude);
      setLongitude(locationData.longitude);
      setLocationName(locationData.name || "Arbeidssted");
    }, 0);
  };

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    try {
      const sjaData = {
        tittel: values.tittel,
        arbeidssted: values.arbeidssted,
        beskrivelse: values.beskrivelse,
        startDato: new Date(values.startDato).toISOString(),
        sluttDato: values.sluttDato ? new Date(values.sluttDato).toISOString() : undefined,
        status: "UTKAST",
        deltakere: values.deltakere,
        latitude: includeWeather ? latitude : undefined,
        longitude: includeWeather ? longitude : undefined,
        locationName: includeWeather ? locationName : undefined,
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
        const malData = {
          ...sjaData,
          sjaId: sja.id,
          navn: values.tittel // Legg til navn-feltet som er påkrevd
        }
        
        await fetch('/api/sja/mal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(malData)
        })
      }

      // Hvis det finnes bilder, last dem opp via kø
      if (bilder.length > 0) {
        const formData = new FormData()
        bilder.forEach(bilde => formData.append('files', bilde))

        try {
          // Last opp bildene via kø
          const bildeResponse = await fetch(`/api/sja/${sja.id}/bilder`, {
            method: 'POST',
            body: formData
          })

          if (!bildeResponse.ok) throw new Error('Kunne ikke laste opp bilder')
          
          // Bildene vil nå bli prosessert i bakgrunnen via Redis-køen
          toast.success('Bilder vil bli lastet opp i bakgrunnen')
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
      tiltak: [],
      latitude: undefined,
      longitude: undefined,
      locationName: undefined
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

          {/* Legg til lokasjonsfelt før risikoer */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <FormLabel>Lokasjon og værforhold</FormLabel>
              <Checkbox 
                id="include-weather" 
                checked={includeWeather}
                onCheckedChange={(checked) => setIncludeWeather(checked as boolean)}
              />
              <FormLabel htmlFor="include-weather" className="font-normal text-sm">
                Inkluder værdata i SJA
              </FormLabel>
            </div>
            
            {includeWeather && (
              <div className="border p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h4 className="text-sm font-medium">Værvarsel - {locationName || "Arbeidssted"}</h4>
                    <p className="text-xs text-gray-500">Vurder værets påvirkning på arbeidet</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsLocationDialogOpen(true)
                    }}
                    className="flex items-center gap-1"
                  >
                    <MapPin className="h-4 w-4" />
                    {latitude && longitude ? "Endre lokasjon" : "Legg til lokasjon"}
                  </Button>
                </div>
                
                {!latitude || !longitude ? (
                  <div className="text-center py-4">
                    <p>Legg til lokasjon for å se værvarsel.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsLocationDialogOpen(true);
                      }}
                      className="mt-2 flex items-center gap-1"
                    >
                      <MapPin className="h-4 w-4" />
                      Legg til lokasjon
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-4 p-2 bg-gray-50 rounded-md">
                    <MapPin className="h-4 w-4 text-green-600 shrink-0" />
                    <div className="text-sm flex-1">
                      <span className="font-medium">{locationName}</span> 
                      <span className="text-gray-500 ml-1">({latitude.toFixed(4)}, {longitude.toFixed(4)})</span>
                    </div>
                  </div>
                )}
                
                <div className="text-xs text-gray-500 mt-4">
                  <p>Værdata er en viktig faktor ved risikovurdering og kan påvirke arbeidets utførelse og sikkerhet.</p>
                  <p>Merk: Høye vindverdier eller betydelig nedbør kan utgjøre en sikkerhetsrisiko.</p>
                </div>
              </div>
            )}
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
                            onValueChange={(value) => {
                              const newSannsynlighet = parseInt(value);
                              field.onChange(newSannsynlighet);
                              
                              // Oppdater risikoVerdi automatisk
                              const alvorlighet = form.getValues(`risikoer.${index}.alvorlighet`) || 1;
                              form.setValue(
                                `risikoer.${index}.risikoVerdi`, 
                                newSannsynlighet * alvorlighet
                              );
                            }}
                            value={field.value.toString()}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {sannsynlighetSkala.map(item => (
                                <SelectItem key={item.verdi} value={item.verdi.toString()}>
                                  {item.verdi} - {item.tekst}
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
                            onValueChange={(value) => {
                              const newAlvorlighet = parseInt(value);
                              field.onChange(newAlvorlighet);
                              
                              // Oppdater risikoVerdi automatisk
                              const sannsynlighet = form.getValues(`risikoer.${index}.sannsynlighet`) || 1;
                              form.setValue(
                                `risikoer.${index}.risikoVerdi`, 
                                sannsynlighet * newAlvorlighet
                              );
                            }}
                            value={field.value.toString()}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {alvorlighetSkala.map(item => (
                                <SelectItem key={item.verdi} value={item.verdi.toString()}>
                                  {item.verdi} - {item.tekst}
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

      {/* LocationDialog for å søke og velge lokasjon */}
      <LocationDialog 
        sjaId="new"
        location={latitude && longitude ? { latitude, longitude, name: locationName } : null}
        open={isLocationDialogOpen}
        onOpenChange={(open) => {
          if (open === false) {
            console.log('Lukker lokasjonsdialog uten å kjøre API-kall');
          }
          setIsLocationDialogOpen(open);
        }}
        onUpdate={async () => {
          console.log('onUpdate kalt for ny SJA - dette skal aldri skje');
          return new Promise<void>((resolve) => {
            resolve();
          });
        }}
        onLocationSelect={handleLocationUpdate}
      />
    </Card>
  )
} 