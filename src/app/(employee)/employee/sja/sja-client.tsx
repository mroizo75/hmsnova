'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { X } from "lucide-react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Combobox } from "@/components/ui/combobox"
import Image from "next/image"
import { Checkbox } from "@/components/ui/checkbox"
import { useMutation } from "@tanstack/react-query"
import { MalVelger } from "@/app/(dashboard)/dashboard/sja/mal-velger"

const sjaFormSchema = z.object({
  tittel: z.string().min(3, "Tittel må være minst 3 tegn"),
  arbeidssted: z.string().min(3, "Arbeidssted må være minst 3 tegn"),
  beskrivelse: z.string().min(10, "Beskrivelse må være minst 10 tegn"),
  startDato: z.string(),
  sluttDato: z.string(),
  deltakere: z.string(),
  risikoer: z.string(),
  tiltak: z.string(),
  ansvarlig: z.string(),
  kommentarer: z.string().optional(),
  produkter: z.array(z.object({
    id: z.string(),
    antall: z.string()
  })).optional(),
  lagreSomMal: z.boolean().default(false)
})

export function SJAClient() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [produkter, setProdukter] = useState<any[]>([])
  const [isLoadingProdukter, setIsLoadingProdukter] = useState(false)
  const [valgteProdukter, setValgteProdukter] = useState<Array<{ produktId: string, mengde: string }>>([])
  const [maler, setMaler] = useState<any[]>([])

  const form = useForm<z.infer<typeof sjaFormSchema>>({
    resolver: zodResolver(sjaFormSchema),
    defaultValues: {
      tittel: "",
      arbeidssted: "",
      beskrivelse: "",
      startDato: "",
      sluttDato: "",
      deltakere: "",
      risikoer: "",
      tiltak: "",
      ansvarlig: "",
      kommentarer: "",
      produkter: [],
      lagreSomMal: false
    }
  })

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: z.infer<typeof sjaFormSchema>) => {
      const formData = new FormData()

      Object.entries(values).forEach(([key, value]) => {
        if (value !== null && value !== undefined && key !== 'images') {
          formData.append(key, value.toString())
        }
      })

      selectedImages.forEach(image => {
        formData.append('images', image)
      })

      formData.append('produkter', JSON.stringify(valgteProdukter))

      const response = await fetch('/api/sja', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Kunne ikke opprette SJA')
      }

      return response.json()
    },
    onSuccess: (data: any) => {
      toast.success('SJA er opprettet')
      router.push('/employee-dashboard')
    },
    onError: (error: any) => {
      toast.error(error instanceof Error ? error.message : 'Kunne ikke opprette SJA')
    }
  })

  useEffect(() => {
    async function hentProdukter() {
      setIsLoadingProdukter(true)
      try {
        const response = await fetch('/api/stoffkartotek')
        if (!response.ok) throw new Error('Kunne ikke hente produkter')
        const data = await response.json()
        setProdukter(data)
      } catch (error) {
        console.error('Feil ved henting av produkter:', error)
        toast.error('Kunne ikke hente produkter fra stoffkartotek')
      } finally {
        setIsLoadingProdukter(false)
      }
    }

    hentProdukter()
  }, [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setSelectedImages(prev => [...prev, ...files])
  }

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleVelgMal = async (malId: string) => {
    try {
      const response = await fetch(`/api/sja/mal/${malId}`)
      if (!response.ok) throw new Error('Kunne ikke hente mal')
      const mal = await response.json()
      
      console.log('Mottatt mal:', mal)
      
      form.reset({
        tittel: mal.navn,
        arbeidssted: mal.arbeidssted,
        beskrivelse: mal.beskrivelse,
        startDato: new Date().toISOString().split('T')[0],
        sluttDato: new Date().toISOString().split('T')[0],
        deltakere: mal.deltakere,
        risikoer: mal.risikoer?.map((r: any) => r.aktivitet).join('\n') || '',
        tiltak: mal.tiltak?.map((t: any) => t.beskrivelse).join('\n') || '',
        ansvarlig: mal.ansvarlig,
        kommentarer: '',
        produkter: [],
        lagreSomMal: false
      })

      console.log('Form verdier etter reset:', form.getValues())
      
      toast.success(`Mal "${mal.navn}" er lastet inn i skjemaet`)

    } catch (error) {
      console.error('Feil ved lasting av mal:', error)
      toast.error('Kunne ikke laste mal')
    }
  }

  return (
    <div className="container max-w-2xl mx-auto p-4">
      <Card className="p-4 md:p-6">
        <Form {...form}>
          <form id="sja-form" onSubmit={form.handleSubmit(mutate as any)} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="tittel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tittel</FormLabel>
                    <FormControl>
                      <Input placeholder="Skriv tittel på SJA" {...field} />
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
                      <Input placeholder="Hvor skal arbeidet utføres?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
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
                        value={field.value ? format(new Date(field.value), 'yyyy-MM-dd') : ''}
                        onChange={e => field.onChange(e.target.value)}
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
                    <FormLabel>Sluttdato</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={field.value ? format(new Date(field.value), 'yyyy-MM-dd') : ''}
                        onChange={e => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="beskrivelse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beskrivelse av arbeidet</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field}
                      className="min-h-[120px]"
                      placeholder="Beskriv arbeidet som skal utføres..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deltakere"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deltakere</FormLabel>
                  <FormControl>
                    <Input placeholder="Navn på deltakere" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="risikoer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Identifiserte risikoer</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Beskriv identifiserte risikoer"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tiltak"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Risikoreduserende tiltak</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Beskriv tiltak for å redusere risiko"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ansvarlig"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ansvarlig person</FormLabel>
                  <FormControl>
                    <Input placeholder="Navn på ansvarlig person" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="kommentarer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kommentarer (valgfritt)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Andre kommentarer eller merknader"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormLabel>Bilder</FormLabel>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full"
                multiple
              />
              
              {selectedImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {selectedImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={URL.createObjectURL(image)}
                        alt={`Bilde ${index + 1}`}
                        width={200}
                        height={200}
                        className="rounded-lg object-cover w-full aspect-square"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <FormLabel>Produkter fra stoffkartotek</FormLabel>
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
                placeholder="Søk etter produkt"
                isLoading={isLoadingProdukter}
              />

              <div className="space-y-2">
                {valgteProdukter.map((valgtProdukt, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge variant="secondary" className="flex-1">
                      {produkter.find(p => p.id === valgtProdukt.produktId)?.produktnavn}
                    </Badge>
                    <Input
                      placeholder="Mengde"
                      className="w-24"
                      value={valgtProdukt.mengde}
                      onChange={(e) => {
                        const nyeProdukter = [...valgteProdukter]
                        nyeProdukter[index].mengde = e.target.value
                        setValgteProdukter(nyeProdukter)
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setValgteProdukter(prev => 
                          prev.filter((_, i) => i !== index)
                        )
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

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

        <div className="flex justify-between pt-6 mt-6 border-t">
          <MalVelger onVelgMal={handleVelgMal} />
          <div className="space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Avbryt
            </Button>
            <Button 
              type="submit"
              form="sja-form"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Lagrer..." : "Lagre"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
} 