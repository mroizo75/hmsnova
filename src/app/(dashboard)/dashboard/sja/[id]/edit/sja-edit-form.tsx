"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { SJAWithRelations } from "@/app/(dashboard)/dashboard/sja/types"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { statusLabels, statusColors } from "@/lib/constants/sja"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { SJAStatus } from "@prisma/client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, Upload, File, Image, ArrowLeft } from "lucide-react"
import { AddVedleggModal } from "../../add-vedlegg-modal"
import { useQueryClient } from "@tanstack/react-query"

const risikoSchema = z.object({
  id: z.string().optional(),
  aktivitet: z.string().min(1, "Aktivitet er påkrevd"),
  fare: z.string().min(1, "Fare er påkrevd"),
  konsekvens: z.string().min(1, "Konsekvens er påkrevd"),
  sannsynlighet: z.coerce.number().int().min(1).max(5),
  alvorlighet: z.coerce.number().int().min(1).max(5),
  risikoVerdi: z.number().int().optional(),
  _isNew: z.boolean().optional(),
  _isDeleted: z.boolean().optional()
})

const tiltakSchema = z.object({
  id: z.string().optional(),
  beskrivelse: z.string().min(1, "Beskrivelse er påkrevd"),
  ansvarlig: z.string().min(1, "Ansvarlig er påkrevd"),
  frist: z.string().optional(),
  status: z.string().min(1, "Status er påkrevd"),
  risikoId: z.string().optional(),
  _isNew: z.boolean().optional(),
  _isDeleted: z.boolean().optional()
})

const formSchema = z.object({
  tittel: z.string().min(1, "Tittel er påkrevd"),
  arbeidssted: z.string().min(1, "Arbeidssted er påkrevd"),
  beskrivelse: z.string().min(1, "Beskrivelse er påkrevd"),
  deltakere: z.string().min(1, "Deltakere er påkrevd"),
  startDato: z.string().min(1, "Startdato er påkrevd"),
  sluttDato: z.string().optional(),
  status: z.enum(["UTKAST", "SENDT_TIL_GODKJENNING", "GODKJENT", "AVVIST", "UTGATT"]),
  kommentar: z.string().optional(),
  risikoer: z.array(risikoSchema),
  tiltak: z.array(tiltakSchema)
})

// Legg til konstanter for sannsynlighet og alvorlighet
const sannsynlighetLabels = {
  1: "Lite sannsynlig",
  2: "Mindre sannsynlig",
  3: "Sannsynlig",
  4: "Meget sannsynlig",
  5: "Svært sannsynlig"
};

const alvorlighetLabels = {
  1: "Ubetydelig",
  2: "Mindre alvorlig",
  3: "Alvorlig",
  4: "Meget alvorlig",
  5: "Katastrofal"
};

interface SJAEditFormProps {
  sja: SJAWithRelations
  userRole: string
}

export function SJAEditForm({ sja, userRole }: SJAEditFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("generelt")
  const [addVedleggOpen, setAddVedleggOpen] = useState(false)
  const router = useRouter()
  const queryClient = useQueryClient()

  // Beregne risikoverdi automatisk
  const beregneRisikoverdi = (sannsynlighet: number, alvorlighet: number) => {
    return sannsynlighet * alvorlighet
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tittel: sja.tittel,
      arbeidssted: sja.arbeidssted,
      beskrivelse: sja.beskrivelse ?? "",
      deltakere: sja.deltakere ?? "",
      startDato: new Date(sja.startDato).toISOString().split('T')[0],
      sluttDato: sja.sluttDato ? new Date(sja.sluttDato).toISOString().split('T')[0] : undefined,
      status: sja.status as SJAStatus,
      kommentar: "",
      risikoer: sja.risikoer?.map(r => ({
        id: r.id,
        aktivitet: r.aktivitet,
        fare: r.fare,
        konsekvens: r.konsekvens ?? "",
        sannsynlighet: r.sannsynlighet,
        alvorlighet: r.alvorlighet,
        risikoVerdi: r.risikoVerdi ?? beregneRisikoverdi(r.sannsynlighet, r.alvorlighet)
      })) ?? [],
      tiltak: sja.tiltak?.map(t => ({
        id: t.id,
        beskrivelse: t.beskrivelse,
        ansvarlig: t.ansvarlig,
        frist: t.frist ? new Date(t.frist).toISOString().split('T')[0] : undefined,
        status: t.status,
        risikoId: t.risikoId ?? undefined
      })) ?? []
    }
  })

  // Feltsett for risikoer og tiltak
  const { fields: risikoFields, append: appendRisiko, remove: removeRisiko } = useFieldArray({
    control: form.control,
    name: "risikoer"
  })

  const { fields: tiltakFields, append: appendTiltak, remove: removeTiltak } = useFieldArray({
    control: form.control,
    name: "tiltak"
  })

  // Legg til en ny risiko
  const handleAddRisiko = () => {
    appendRisiko({
      aktivitet: "",
      fare: "",
      konsekvens: "",
      sannsynlighet: 1,
      alvorlighet: 1,
      risikoVerdi: 1,
      _isNew: true
    })
  }

  // Legg til nytt tiltak
  const handleAddTiltak = () => {
    appendTiltak({
      beskrivelse: "",
      ansvarlig: "",
      frist: undefined,
      status: "Planlagt",
      risikoId: undefined,
      _isNew: true
    })
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("onSubmit kalt med verdier:", values)
    setIsSubmitting(true)
    try {
      // Valider form-data først
      const validationResult = formSchema.safeParse(values)
      if (!validationResult.success) {
        console.error("Valideringsfeil:", validationResult.error)
        toast.error("Vennligst fyll ut alle påkrevde felt")
        setIsSubmitting(false)
        return
      }

      const statusChanged = values.status !== sja.status
      console.log("Status endret:", statusChanged, "Fra:", sja.status, "Til:", values.status)

      // Beregn risikoverdi for alle risikoer
      const oppdaterteRisikoer = values.risikoer.map(risiko => ({
        ...risiko,
        risikoVerdi: beregneRisikoverdi(risiko.sannsynlighet, risiko.alvorlighet)
      }))

      // Hvis status er endret, bruk behandle-endepunktet for statusoppdatering først
      if (statusChanged) {
        console.log("Sender statusoppdatering til API")
        try {
          const statusEndpoint = `/api/sja/${sja.id}/behandle`
          const statusBody = {
            status: values.status,
            kommentar: values.kommentar || `Status endret til ${statusLabels[values.status as keyof typeof statusLabels]}`,
            redirect: "/dashboard/sja"
          }

          console.log("Status-oppdatering data:", JSON.stringify(statusBody, null, 2))

          const statusResponse = await fetch(statusEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(statusBody)
          })

          if (!statusResponse.ok) {
            // Sjekk om responsen er en omdirigering
            if (statusResponse.redirected) {
              // Hvis serveren omdirigerer, følg omdirigering
              window.location.href = statusResponse.url
              return
            }
            
            const errorData = await statusResponse.json()
            console.error("Feil ved statusoppdatering:", errorData)
            throw new Error(errorData.error || 'Kunne ikke oppdatere status')
          }
          
          // Hvis vi kommer hit, har vi fått en vellykket respons men ikke en omdirigering
          console.log("Status oppdatert vellykket")
        } catch (statusError) {
          console.error("Feil ved statusoppdatering:", statusError)
          toast.error('Kunne ikke oppdatere status, prøver generell oppdatering')
        }
      }

      // Oppdater SJA-dataene med hovedendepunktet
      console.log("Sender SJA-oppdatering til API")
      
      // Håndter risikoer ved å separere nye og eksisterende
      const eksisterendeRisikoer = oppdaterteRisikoer.filter(r => r.id && !r._isDeleted);
      const nyeRisikoer = oppdaterteRisikoer.filter(r => !r.id && !r._isDeleted);
      const slettedeRisikoIds = oppdaterteRisikoer.filter(r => r.id && r._isDeleted).map(r => r.id);

      // Håndter tiltak ved å separere nye og eksisterende
      const eksisterendeTiltak = values.tiltak.filter(t => t.id && !t._isDeleted);
      const nyeTiltak = values.tiltak.filter(t => !t.id && !t._isDeleted);
      const slettedeTiltakIds = values.tiltak.filter(t => t.id && t._isDeleted).map(t => t.id);
      
      // Bygg opp updateBody i formatet som API-et forventer
      const updateBody = {
        id: sja.id, // Viktig å inkludere ID i hoveddataene
        tittel: values.tittel,
        arbeidssted: values.arbeidssted,
        beskrivelse: values.beskrivelse,
        deltakere: values.deltakere,
        startDato: new Date(values.startDato).toISOString(),
        sluttDato: values.sluttDato ? new Date(values.sluttDato).toISOString() : null,
        status: values.status, // Inkluder status selv om den allerede er oppdatert
        risikoer: {
          update: eksisterendeRisikoer.map(r => ({
            where: { id: r.id },
            data: {
              aktivitet: r.aktivitet,
              fare: r.fare,
              konsekvens: r.konsekvens || "",
              sannsynlighet: r.sannsynlighet,
              alvorlighet: r.alvorlighet,
              risikoVerdi: r.risikoVerdi || beregneRisikoverdi(r.sannsynlighet, r.alvorlighet)
            }
          })),
          create: nyeRisikoer.map(r => ({
            aktivitet: r.aktivitet,
            fare: r.fare,
            konsekvens: r.konsekvens || "",
            sannsynlighet: r.sannsynlighet,
            alvorlighet: r.alvorlighet,
            risikoVerdi: r.risikoVerdi || beregneRisikoverdi(r.sannsynlighet, r.alvorlighet)
          })),
          deleteMany: slettedeRisikoIds.length > 0 ? { id: { in: slettedeRisikoIds } } : undefined
        },
        tiltak: {
          update: eksisterendeTiltak.map(t => ({
            where: { id: t.id },
            data: {
              beskrivelse: t.beskrivelse,
              ansvarlig: t.ansvarlig,
              frist: t.frist ? new Date(t.frist).toISOString() : null,
              status: t.status,
              risikoId: t.risikoId || null
            }
          })),
          create: nyeTiltak.map(t => ({
            beskrivelse: t.beskrivelse,
            ansvarlig: t.ansvarlig,
            frist: t.frist ? new Date(t.frist).toISOString() : null,
            status: t.status,
            risikoId: t.risikoId || null
          })),
          deleteMany: slettedeTiltakIds.length > 0 ? { id: { in: slettedeTiltakIds } } : undefined
        }
      }

      console.log("SJA oppdateringsdata:", JSON.stringify(updateBody, null, 2))

      const updateResponse = await fetch(`/api/sja`, {  // Bruker hovedendepunktet
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateBody)
      })

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json()
        console.error("Feil ved SJA-oppdatering:", errorData)
        throw new Error(errorData.error || 'Kunne ikke oppdatere SJA')
      }

      console.log("Oppdatering vellykket, navigerer til /dashboard/sja")
      
      // Invalider React Query cache for å sikre at data blir oppdatert i UI
      queryClient.invalidateQueries({ queryKey: ['sja-list'] })
      queryClient.invalidateQueries({ queryKey: ['sja-detail', sja.id] })
      
      toast.success('SJA oppdatert')
      router.push('/dashboard/sja')
      router.refresh()
    } catch (error) {
      console.error('Feil ved oppdatering av SJA:', error)
      toast.error(error instanceof Error ? error.message : 'Kunne ikke oppdatere SJA')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Hjelper for å vise riktig status-badge
  const StatusBadge = ({ status }: { status: SJAStatus }) => (
    <Badge className={statusColors[status]}>
      {statusLabels[status]}
    </Badge>
  )

  // Hjelper for å avgjøre om status-endring er tillatt
  const canChangeStatus = userRole === "COMPANY_ADMIN"

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/dashboard/sja/${sja.id}`)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Tilbake til SJA
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-4xl">
          <TabsTrigger value="generelt">Generell informasjon</TabsTrigger>
          <TabsTrigger value="risikoer">Risikoer ({risikoFields.length})</TabsTrigger>
          <TabsTrigger value="tiltak">Tiltak ({tiltakFields.length})</TabsTrigger>
          <TabsTrigger value="vedlegg">Vedlegg og bilder</TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <TabsContent value="generelt" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Venstre kolonne - Grunnleggende info */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Grunnleggende informasjon</CardTitle>
                      <CardDescription>
                        Rediger grunnleggende informasjon om SJA-en
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
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

                      {/* Datoer i samme rad */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                <Input 
                                  type="date" 
                                  {...field}
                                  value={field.value || ""} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Beskrivelse */}
                      <FormField
                        control={form.control}
                        name="beskrivelse"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Beskrivelse</FormLabel>
                            <FormControl>
                              <Textarea {...field} className="min-h-[120px]" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Deltakere */}
                      <FormField
                        control={form.control}
                        name="deltakere"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Deltakere</FormLabel>
                            <FormControl>
                              <Textarea {...field} className="min-h-[120px]" placeholder="Liste over deltakere, en per linje" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Høyre kolonne - Status */}
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Status</CardTitle>
                      <CardDescription>
                        Endre status for SJA-en
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="mb-4">
                        <p>Nåværende status:</p>
                        <div className="mt-1">
                          <StatusBadge status={sja.status as SJAStatus} />
                        </div>
                      </div>

                      <Separator />

                      {canChangeStatus ? (
                        <>
                          <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel>Ny status</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-1"
                                  >
                                    {Object.entries(statusLabels).map(([key, label]) => (
                                      <FormItem key={key} className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                          <RadioGroupItem value={key} />
                                        </FormControl>
                                        <FormLabel className="font-normal cursor-pointer">
                                          {label}
                                        </FormLabel>
                                      </FormItem>
                                    ))}
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="kommentar"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Kommentar</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    {...field} 
                                    placeholder="Legg til kommentar om statusendringen" 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      ) : (
                        <div className="text-gray-500 italic">
                          Du har ikke tilgang til å endre status på denne SJA-en.
                          Bare admin kan endre status.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="risikoer" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Identifiserte risikoer</CardTitle>
                  <CardDescription>
                    Legg til eller endre risikoer knyttet til denne SJA-en
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {risikoFields.map((risiko, index) => (
                      <div key={risiko.id || index} className="border p-4 rounded-md relative">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          onClick={() => removeRisiko(index)}
                          className="absolute top-2 right-2 h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Slett risiko</span>
                        </Button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <FormField
                            control={form.control}
                            name={`risikoer.${index}.aktivitet`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Aktivitet</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
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
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="mb-4">
                          <FormField
                            control={form.control}
                            name={`risikoer.${index}.konsekvens`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Konsekvens</FormLabel>
                                <FormControl>
                                  <Textarea {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name={`risikoer.${index}.sannsynlighet`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Sannsynlighet (1-5)</FormLabel>
                                <FormControl>
                                  <select 
                                    className="w-full h-10 px-3 py-2 border border-input bg-background text-foreground rounded-md"
                                    value={field.value}
                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                  >
                                    {Object.entries(sannsynlighetLabels).map(([value, label]) => (
                                      <option key={value} value={value}>
                                        {value} - {label}
                                      </option>
                                    ))}
                                  </select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`risikoer.${index}.alvorlighet`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Alvorlighet (1-5)</FormLabel>
                                <FormControl>
                                  <select 
                                    className="w-full h-10 px-3 py-2 border border-input bg-background text-foreground rounded-md"
                                    value={field.value}
                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                  >
                                    {Object.entries(alvorlighetLabels).map(([value, label]) => (
                                      <option key={value} value={value}>
                                        {value} - {label}
                                      </option>
                                    ))}
                                  </select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div>
                            <FormLabel>Risikoverdi</FormLabel>
                            <div className="h-10 px-3 py-2 border border-input bg-background text-muted-foreground rounded-md">
                              {form.watch(`risikoer.${index}.sannsynlighet`) * form.watch(`risikoer.${index}.alvorlighet`)}
                            </div>
                            <FormDescription className="text-xs">
                              Sannsynlighet × Alvorlighet
                            </FormDescription>
                          </div>
                        </div>
                      </div>
                    ))}

                    <Button type="button" variant="outline" onClick={handleAddRisiko} className="w-full">
                      <Plus className="mr-2 h-4 w-4" /> Legg til risiko
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tiltak" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tiltak for å redusere risiko</CardTitle>
                  <CardDescription>
                    Legg til eller endre tiltak knyttet til denne SJA-en
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {tiltakFields.map((tiltak, index) => (
                      <div key={tiltak.id || index} className="border p-4 rounded-md relative">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          onClick={() => removeTiltak(index)}
                          className="absolute top-2 right-2 h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Slett tiltak</span>
                        </Button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <FormField
                            control={form.control}
                            name={`tiltak.${index}.beskrivelse`}
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

                          <div className="space-y-4">
                            <FormField
                              control={form.control}
                              name={`tiltak.${index}.ansvarlig`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Ansvarlig</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`tiltak.${index}.status`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Status</FormLabel>
                                  <FormControl>
                                    <select 
                                      className="w-full h-10 px-3 py-2 border border-input bg-background text-foreground rounded-md"
                                      {...field}
                                    >
                                      <option value="Planlagt">Planlagt</option>
                                      <option value="Pågående">Pågående</option>
                                      <option value="Fullført">Fullført</option>
                                      <option value="Utsatt">Utsatt</option>
                                      <option value="Kansellert">Kansellert</option>
                                    </select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        <div>
                          <FormField
                            control={form.control}
                            name={`tiltak.${index}.frist`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Frist</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="date" 
                                    {...field}
                                    value={field.value || ""} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Tilknytning til risiko - valgfritt */}
                        {risikoFields.length > 0 && (
                          <div className="mt-4">
                            <FormField
                              control={form.control}
                              name={`tiltak.${index}.risikoId`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Knyttet til risiko (valgfritt)</FormLabel>
                                  <FormControl>
                                    <select 
                                      className="w-full h-10 px-3 py-2 border border-input bg-background text-foreground rounded-md"
                                      {...field}
                                      value={field.value || ""}
                                    >
                                      <option value="">-- Ingen tilknytning --</option>
                                      {risikoFields.map((risiko, risikoIndex) => (
                                        <option key={risiko.id || risikoIndex} value={risiko.id}>
                                          {form.watch(`risikoer.${risikoIndex}.aktivitet`)} - {form.watch(`risikoer.${risikoIndex}.fare`)}
                                        </option>
                                      ))}
                                    </select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </div>
                    ))}

                    <Button type="button" variant="outline" onClick={handleAddTiltak} className="w-full">
                      <Plus className="mr-2 h-4 w-4" /> Legg til tiltak
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vedlegg" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Vedlegg</CardTitle>
                    <CardDescription>
                      Dokumenter knyttet til denne SJA-en
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {sja.vedlegg && sja.vedlegg.length > 0 ? (
                        <ul className="space-y-2">
                          {sja.vedlegg.map((vedlegg) => (
                            <li key={vedlegg.id} className="flex items-center justify-between border rounded-md p-2">
                              <div className="flex items-center gap-2">
                                <File className="h-4 w-4 text-blue-500" />
                                <span>{vedlegg.navn || "Vedlegg"}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted-foreground">Ingen vedlegg er lagt til</p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="button" variant="outline" onClick={() => setAddVedleggOpen(true)} className="w-full">
                      <Upload className="mr-2 h-4 w-4" /> Last opp nytt vedlegg
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Bilder</CardTitle>
                    <CardDescription>
                      Bilder knyttet til denne SJA-en
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {sja.bilder && sja.bilder.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                          {sja.bilder.map((bilde) => (
                            <div key={bilde.id} className="border rounded-md p-2 flex items-center justify-center bg-muted h-24">
                              <Image className="h-5 w-5 mr-2" />
                              <span className="text-sm truncate">{bilde.beskrivelse || "Bilde"}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">Ingen bilder er lagt til</p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="button" variant="outline" onClick={() => setAddVedleggOpen(true)} className="w-full">
                      <Upload className="mr-2 h-4 w-4" /> Last opp vedlegg (kan også brukes for bilder)
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>

            {/* Handlingsknapper */}
            <div className="flex justify-end mt-6 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/dashboard/sja/${sja.id}`)}
              >
                Avbryt
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Lagrer..." : "Lagre endringer"}
              </Button>
            </div>
          </form>
        </Form>
      </Tabs>

      {/* Modal for å legge til vedlegg */}
      <AddVedleggModal
        open={addVedleggOpen}
        onOpenChange={setAddVedleggOpen}
        sjaId={sja.id}
      />
    </div>
  )
} 