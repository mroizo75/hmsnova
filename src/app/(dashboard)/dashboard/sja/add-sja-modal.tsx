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
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { NotificationType } from "@prisma/client"
import { Checkbox } from "@/components/ui/checkbox"
import { MalVelger } from "./mal-velger"
import { Plus, Trash, CloudRain, Snowflake, Sun, Wind, AlertTriangle, RefreshCcw, ThermometerSun, Thermometer, MapPin } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { format, isSameDay, parseISO } from 'date-fns'
import { nb } from 'date-fns/locale'
import { LocationDialog } from './location-dialog'

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

// Definerer typer for værdata
interface DailyForecast {
  date: Date;
  day: string;
  symbolCode: string;
  maxTemp: number;
  minTemp: number;
  maxWind: number;
  totalPrecipitation: number;
  riskLevel: 'high' | 'medium' | 'low';
}

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

// Funksjon for å hente værdata
async function fetchWeatherData(latitude: number, longitude: number) {
  try {
    // Sikre at vi har gyldige tall for koordinatene
    if (isNaN(latitude) || isNaN(longitude)) {
      throw new Error('Ugyldige koordinater');
    }
    
    // Formater koordinater for å sikre gyldige verdier
    const formattedLat = parseFloat(latitude.toString()).toFixed(4);
    const formattedLon = parseFloat(longitude.toString()).toFixed(4);
    
    const url = `/api/weather?lat=${formattedLat}&lon=${formattedLon}`;
    
    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      next: { revalidate: 0 }
    });
    
    if (!response.ok) {
      throw new Error(`Værdata-feil: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Feil ved henting av værdata:', error);
    throw error;
  }
}

// Funksjon for å gruppere værdata etter dag
function groupForecastsByDay(timeseries: any[]): DailyForecast[] {
  if (!timeseries || !Array.isArray(timeseries)) return [];
  
  const dailyData: Map<string, any[]> = new Map();
  
  // Gruppere alle timeseries etter dato
  timeseries.forEach(item => {
    const date = parseISO(item.time);
    const dateKey = format(date, 'yyyy-MM-dd');
    
    if (!dailyData.has(dateKey)) {
      dailyData.set(dateKey, []);
    }
    
    dailyData.get(dateKey)?.push(item);
  });
  
  // Opprette daglige prognoser
  const result: DailyForecast[] = [];
  
  dailyData.forEach((dayForecasts, dateKey) => {
    // Finn temperaturer og vind
    const temperatures = dayForecasts.map(f => f.data.instant.details.air_temperature);
    const winds = dayForecasts.map(f => f.data.instant.details.wind_speed);
    
    // Finn nedbør (samlet for dagen)
    let totalPrecipitation = 0;
    dayForecasts.forEach(f => {
      if (f.data.next_1_hours) {
        totalPrecipitation += f.data.next_1_hours.details.precipitation_amount;
      } else if (f.data.next_6_hours) {
        totalPrecipitation += f.data.next_6_hours.details.precipitation_amount / 6; // Fordel over timer
      }
    });
    
    // Velg en representativ symbol kode for dagen (helst fra midt på dagen)
    const afternoonForecast = dayForecasts.find(f => {
      const hour = parseISO(f.time).getHours();
      return hour >= 12 && hour <= 15;
    });
    
    const symbolCode = afternoonForecast?.data.next_1_hours?.summary.symbol_code || 
                       dayForecasts[0]?.data.next_1_hours?.summary.symbol_code ||
                       'clearsky_day';
    
    const date = parseISO(dateKey);
    const maxTemp = Math.max(...temperatures);
    const minTemp = Math.min(...temperatures);
    const maxWind = Math.max(...winds);
    
    // Vurder værrisiko
    let riskLevel: 'high' | 'medium' | 'low' = 'low';
    if (maxWind > 15 || totalPrecipitation > 5 || minTemp < -10 || maxTemp > 30) {
      riskLevel = 'high';
    } else if (maxWind > 8 || totalPrecipitation > 1 || minTemp < 0 || maxTemp > 25) {
      riskLevel = 'medium';
    }
    
    result.push({
      date,
      day: format(date, 'EE', { locale: nb }),
      symbolCode,
      maxTemp,
      minTemp,
      maxWind,
      totalPrecipitation,
      riskLevel
    });
  });
  
  // Sorter etter dato
  return result.sort((a, b) => a.date.getTime() - b.date.getTime());
}

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
  
  // Værdata-relaterte states
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [locationName, setLocationName] = useState<string>('Arbeidssted')
  const [includeWeather, setIncludeWeather] = useState<boolean>(false)
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
      tiltak: []
    }
  })

  const { control, reset } = form;
  const { fields: risikoFields, append: appendRisiko, remove: removeRisiko } = useFieldArray({
    control,
    name: "risikoer",
  });
  
  const { fields: tiltakFields, append: appendTiltak, remove: removeTiltak } = useFieldArray({
    control,
    name: "tiltak",
  });
  
  // Effekt for å oppdatere risikoVerdi basert på sannsynlighet og alvorlighet
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      // Sjekk om endringen er relatert til sannsynlighet eller alvorlighet
      if (name?.includes('risikoer') && (name?.includes('sannsynlighet') || name?.includes('alvorlighet'))) {
        const risikoer = form.getValues('risikoer');
        
        if (risikoer) {
          risikoer.forEach((risiko, index) => {
            // Oppdater risikoVerdi for hver risiko
            const risikoVerdi = (risiko.sannsynlighet || 1) * (risiko.alvorlighet || 1);
            form.setValue(`risikoer.${index}.risikoVerdi`, risikoVerdi);
          });
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  // Effekt for å sette koordinater basert på arbeidssted
  useEffect(() => {
    if (includeWeather) {
      const arbeidssted = form.watch('arbeidssted');
      if (arbeidssted) {
        setLocationName(arbeidssted);
      }
    }
  }, [form.watch('arbeidssted'), includeWeather]);

  // Hent værdata hvis koordinater er tilgjengelige
  const { 
    data: weatherData, 
    isLoading: isLoadingWeather, 
    error: weatherError, 
    refetch: refetchWeather 
  } = useQuery({
    queryKey: ['weather', latitude, longitude],
    queryFn: () => latitude && longitude ? fetchWeatherData(latitude, longitude) : null,
    enabled: !!latitude && !!longitude && includeWeather,
    staleTime: 5 * 60 * 1000, // 5 minutter
  });

  // Behandle data til daglige prognoser
  const dailyForecasts = weatherData && weatherData.properties?.timeseries ? 
    groupForecastsByDay(weatherData.properties.timeseries.slice(0, 72)).slice(0, 3) : [];

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
              latitude: includeWeather ? latitude : null,
              longitude: includeWeather ? longitude : null,
              locationName: includeWeather ? locationName : null,
              weatherData: includeWeather && weatherData ? {
                forecasts: dailyForecasts,
                timestamp: new Date().toISOString(),
                source: 'MET API'
              } : null,
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
            latitude: includeWeather ? latitude : null,
            longitude: includeWeather ? longitude : null,
            locationName: includeWeather ? locationName : null,
            weatherData: includeWeather && weatherData ? {
              forecasts: dailyForecasts,
              timestamp: new Date().toISOString(),
              source: 'MET API'
            } : null,
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
      
      // Invalider alle SJA-relaterte queries for oppdatering i UI
      queryClient.invalidateQueries({ queryKey: ['sja-list'] })
      
      // Tilbakestill skjemaet og lukk dialogen
      form.reset()
      setBilder([])
      setValgteProdukter([])
      toast.success('SJA opprettet!')
      
      // Kall onAdd-callback med dataene
      onAdd(data)
      onOpenChange(false)
    },
    onError: (error) => {
      console.error('Feil ved oppretting av SJA:', error)
      toast.error('Kunne ikke opprette SJA', {
        description: error instanceof Error ? error.message : 'Ukjent feil'
      })
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

  // Funksjoner for værdatavisning
  function getWeatherIcon(symbolCode: string) {
    if (symbolCode.includes('rain')) {
      return <CloudRain className="h-5 w-5 text-blue-500" />
    } else if (symbolCode.includes('snow')) {
      return <Snowflake className="h-5 w-5 text-blue-200" />
    } else if (symbolCode.includes('clear')) {
      return <Sun className="h-5 w-5 text-yellow-500" />
    } else if (symbolCode.includes('cloud')) {
      return <CloudRain className="h-5 w-5 text-gray-500" strokeWidth={1} />
    } else {
      return <Sun className="h-5 w-5 text-yellow-500" />
    }
  }

  function getRiskBadge(riskLevel: string) {
    switch (riskLevel) {
      case 'high':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            <span>Høy værrisiko</span>
          </Badge>
        )
      case 'medium':
        return (
          <Badge variant="warning" className="flex items-center gap-1 bg-amber-500">
            <AlertTriangle className="h-3 w-3" />
            <span>Moderat værrisiko</span>
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-green-600 border-green-600 flex items-center gap-1">
            <span>Lav værrisiko</span>
          </Badge>
        )
    }
  }

  // Bruk handleLocationUpdate for å håndtere lokasjonsoppdateringer fra LocationDialog
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
      
      // Oppdater værdata med de nye koordinatene - Ikke utfør API-kall før timer fires
      if (locationData.latitude && locationData.longitude) {
        // Bruk ytterligere setTimeout for å unngå kjeding av state-oppdateringer
        setTimeout(() => {
          console.log('Oppdaterer værdata med koordinater:', locationData.latitude, locationData.longitude);
          refetchWeather();
        }, 100);
      }
    }, 0);
  };

  async function onSave() {
    try {
      setIsSubmitting(true);

      // Opprett formdata objekt for å kunne laste opp bilder
      const formData = new FormData();
      
      // Legg til all form-data
      const formValues = form.getValues();
      
      // Strukturer SJA-objektet med alle nødvendige felter
      const sjaObject = {
        tittel: formValues.tittel,
        arbeidssted: formValues.arbeidssted,
        beskrivelse: formValues.beskrivelse,
        startDato: formValues.startDato,
        sluttDato: formValues.sluttDato || null,
        deltakere: formValues.deltakere,
        risikoer: formValues.risikoer,
        tiltak: formValues.tiltak,
        lagreSomMal: formValues.lagreSomMal || false,
        latitude: formValues.latitude,
        longitude: formValues.longitude,
        locationName: formValues.locationName
      };

      // Konverter SJA objektet til JSON og legg til i formData
      formData.append('data', JSON.stringify(sjaObject));
      
      // Legg til bilder i FormData
      bilder.forEach((file, index) => {
        formData.append(`bilde-${index}`, file);
      });
      
      // Logg data som skal sendes for debugging
      console.log('Sender SJA:', JSON.stringify(sjaObject, null, 2));
      
      // Send formData til API
      const response = await fetch('/api/sja/submit', {
        method: 'POST',
        body: formData,
      });

      // Sjekk om responsen er OK
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Kunne ikke lagre SJA');
      }

      // Parse responsen
      const data = await response.json();
      
      // Invalider alle SJA-relaterte queries for oppdatering i UI
      queryClient.invalidateQueries({ queryKey: ['sja-list'] });
      
      // Informer brukeren om velykket lagring
      toast.success('SJA opprettet!', {
        description: `SJA "${sjaObject.tittel}" er lagret`
      });
      
      // Reset skjema og lukk dialog
      form.reset();
      setBilder([]);
      setValgteProdukter([]);
      
      onAdd(data);
      onOpenChange(false);
      
    } catch (error) {
      console.error('Feil ved lagring av SJA:', error);
      toast.error('Kunne ikke lagre SJA', {
        description: error instanceof Error ? error.message : 'Ukjent feil'
      });
    } finally {
      setIsSubmitting(false);
    }
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
              <form 
                id="sja-form" 
                onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                  // Kun kjør submit når den sendes eksplisitt via Lagre-knappen
                  const submitter = (e.nativeEvent as any).submitter;
                  if (submitter?.getAttribute('form-action') !== 'submit-sja') {
                    e.preventDefault();
                    console.log('Forhindret utilsiktet formsubmit fra:', submitter || 'ukjent kilde');
                    return;
                  }
                  
                  // Ellers, fortsett med normal submission
                  form.handleSubmit(onSubmit)(e);
                }} 
                className="space-y-6 m-2"
              >
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
                              onClick={(e) => {
                                e.preventDefault()
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

                {/* Værdata for arbeidsstedet */}
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
                          <h4 className="text-sm font-medium">Værvarsel - {locationName}</h4>
                          <p className="text-xs text-gray-500">Vurder værets påvirkning på arbeidet</p>
                        </div>
                        <div className="flex items-center gap-2">
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
                          
                          <Button 
                            variant="ghost" 
                            size="sm"
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              refetchWeather();
                            }}
                            disabled={isLoadingWeather}
                          >
                            <RefreshCcw className="h-4 w-4 mr-1" />
                            Oppdater
                          </Button>
                        </div>
                      </div>
                      
                      {isLoadingWeather ? (
                        <div className="text-center py-4">Laster værdata...</div>
                      ) : weatherError ? (
                        <div className="text-red-500 text-sm">
                          Kunne ikke laste værdata. Vennligst prøv igjen.
                        </div>
                      ) : dailyForecasts.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                          {dailyForecasts.map((day, index) => (
                            <Card key={index} className={`overflow-hidden border ${
                              day.riskLevel === 'high' ? 'border-red-200 bg-red-50' : 
                              day.riskLevel === 'medium' ? 'border-yellow-200 bg-yellow-50' : 
                              'border-green-200 bg-green-50'
                            }`}>
                              <CardContent className="p-2">
                                <div className="text-xs font-medium mb-1">
                                  {format(day.date, 'EEE d.MMM', { locale: nb })}
                                  {isSameDay(day.date, new Date()) && <span className="ml-1">(i dag)</span>}
                                </div>
                                <div className="flex justify-between items-center mb-1">
                                  <div className="flex items-center gap-1">
                                    {getWeatherIcon(day.symbolCode)}
                                    <span className="text-sm">{day.maxTemp.toFixed(0)}°C</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Wind className="h-4 w-4 text-blue-500" />
                                    <span className="text-sm">{day.maxWind.toFixed(1)} m/s</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 text-xs mb-1">
                                  <CloudRain className="h-3 w-3" />
                                  <span>{day.totalPrecipitation.toFixed(1)} mm</span>
                                </div>
                                <div>{getRiskBadge(day.riskLevel)}</div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : !latitude || !longitude ? (
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
                        <div className="text-center py-4">
                          <p>Ingen værdata tilgjengelig for denne lokasjonen.</p>
                          <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              refetchWeather();
                            }}
                            className="mt-2"
                          >
                            Prøv igjen
                          </Button>
                        </div>
                      )}
                      
                      {/* Vis valgt lokasjon hvis tilgjengelig */}
                      {latitude && longitude && (
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
                      onClick={(e) => {
                        e.preventDefault();
                        const initialSannsynlighet = 1;
                        const initialAlvorlighet = 1;
                        appendRisiko({ 
                          aktivitet: "", 
                          fare: "", 
                          konsekvens: "",
                          sannsynlighet: initialSannsynlighet,
                          alvorlighet: initialAlvorlighet,
                          risikoVerdi: initialSannsynlighet * initialAlvorlighet
                        });
                      }}
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
                          onClick={(e) => {
                            e.preventDefault();
                            removeRisiko(index);
                          }}
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
                      onClick={(e) => {
                        e.preventDefault();
                        appendTiltak({ 
                          beskrivelse: "", 
                          ansvarlig: "", 
                          status: "PLANLAGT",
                          frist: null 
                        });
                      }}
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
                          onClick={(e) => {
                            e.preventDefault();
                            removeTiltak(index);
                          }}
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
                form-action="submit-sja"
                form="sja-form" 
                disabled={isPending}
              >
                {isPending ? "Lagrer..." : "Lagre"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* LocationDialog for å søke og velge lokasjon */}
      <LocationDialog
        sjaId="new" // Siden dette er en ny SJA, bruker vi "new" som ID
        location={latitude && longitude ? { latitude, longitude, name: locationName } : null}
        open={isLocationDialogOpen}
        onOpenChange={(open) => {
          // Forsikre om at vi ikke oppdaterer unødvendig når dialogen lukkes
          if (open === false) {
            console.log('Lukker lokasjonsdialog uten å kjøre API-kall');
          }
          setIsLocationDialogOpen(open);
        }}
        onUpdate={async () => {
          // Denne skal aldri kalles for nye SJA-er, men vi inkluderer den for typesjekking
          console.log('onUpdate kalt for ny SJA - dette skal aldri skje');
          return new Promise<void>((resolve) => {
            resolve();
          });
        }}
        onLocationSelect={handleLocationUpdate}
      />
    </>
  )
} 