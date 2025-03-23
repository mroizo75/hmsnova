"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { CloudSun, Plus } from "lucide-react"
import { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { WeatherMiniPreview } from "./weather-mini-preview"
import { parseISO, format } from "date-fns"
import { nb } from "date-fns/locale"
import { useQueryClient } from "@tanstack/react-query"

const formSchema = z.object({
  description: z.string().min(5, "Beskrivelse må være minst 5 tegn"),
  consequence: z.string().min(5, "Konsekvens må være minst 5 tegn"),
  probability: z.string().min(1, "Velg sannsynlighet"),
  severity: z.string().min(1, "Velg alvorlighetsgrad"),
  existingMeasures: z.string().optional(),
  includeWeatherRisk: z.boolean().default(false),
  weatherRiskNotes: z.string().optional(),
})

interface AddHazardDialogProps {
  assessmentId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onHazardAdded?: () => void
  location?: { 
    latitude: number | null
    longitude: number | null
    name?: string | null
  } | null;
}

export function AddHazardDialog({ assessmentId, open, onOpenChange, onHazardAdded, location }: AddHazardDialogProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showWeatherPreview, setShowWeatherPreview] = useState(false)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      consequence: "",
      probability: "",
      severity: "",
      existingMeasures: "",
      includeWeatherRisk: false,
      weatherRiskNotes: "",
    },
  })

  // Reset skjemaet når dialogen åpnes
  useEffect(() => {
    if (open) {
      form.reset({
        description: "",
        consequence: "",
        probability: "",
        severity: "",
        existingMeasures: "",
        includeWeatherRisk: false,
        weatherRiskNotes: "",
      })
      setShowWeatherPreview(false)
    }
  }, [open, form])

  // Mer robust sjekk for gyldig lokasjon med riktig geografisk område
  const hasValidLocation = (() => {
    // Hvis location er null eller undefined, er det ikke gyldig
    if (!location) {
      console.log("[AddHazard] hasValidLocation: Location er null eller undefined");
      return false;
    }
    
    // Sjekk om latitude og longitude finnes
    const hasLatitude = location.latitude !== null && location.latitude !== undefined;
    const hasLongitude = location.longitude !== null && location.longitude !== undefined;
    
    if (!hasLatitude || !hasLongitude) {
      console.log("[AddHazard] hasValidLocation: Latitude eller longitude mangler", { 
        hasLatitude, 
        hasLongitude,
        latType: typeof location.latitude,
        longType: typeof location.longitude
      });
      return false;
    }
    
    // Konverter til tall
    const latNum = parseFloat(String(location.latitude));
    const lonNum = parseFloat(String(location.longitude));
    
    // Sjekk om tallene er NaN
    if (isNaN(latNum) || isNaN(lonNum)) {
      console.log("[AddHazard] hasValidLocation: Koordinater er ikke gyldige tall", {
        latNum, 
        lonNum, 
        originalLat: location.latitude,
        originalLon: location.longitude
      });
      return false;
    }
    
    // Avrund til 6 desimaler for sammenligning (unngå floating point unøyaktighet)
    const roundedLat = Math.round(latNum * 1000000) / 1000000;
    const roundedLon = Math.round(lonNum * 1000000) / 1000000;
    
    // Sjekk om tallene er gyldige og innenfor gyldig geografisk område
    const isValid = roundedLat >= -90 && roundedLat <= 90 && 
           roundedLon >= -180 && roundedLon <= 180;
    
    console.log("[AddHazard] hasValidLocation resultat:", isValid, {
      roundedLat, 
      roundedLon, 
      originalLat: latNum,
      originalLon: lonNum
    });
    
    return isValid;
  })();

  // Vis værprognoser når brukeren velger å inkludere værvurdering
  useEffect(() => {
    const includeWeather = form.watch("includeWeatherRisk");
    console.log("[AddHazard] includeWeatherRisk endret til:", includeWeather);
    
    // Detaljert logging av location-objektet
    if (location) {
      console.log("[AddHazard] Location info:", {
        latitude: location.latitude,
        longitude: location.longitude,
        name: location.name,
        latitudeType: typeof location.latitude,
        longitudeType: typeof location.longitude
      });
    } else {
      console.log("[AddHazard] Ingen lokasjon tilgjengelig");
    }
    
    console.log("[AddHazard] hasValidLocation:", hasValidLocation);
    
    if (includeWeather && !hasValidLocation) {
      toast.error("Mangler gyldig lokasjon", {
        description: "Du må legge til en gyldig lokasjon for å vurdere værrisiko"
      });
      // Slå av includeWeatherRisk hvis vi ikke har en gyldig lokasjon
      form.setValue("includeWeatherRisk", false);
    } else {
      setShowWeatherPreview(includeWeather);
    }
  }, [form.watch("includeWeatherRisk"), location, hasValidLocation, form]);

  // Legg til loggføring for å se hva som sendes inn
  useEffect(() => {
    // Logg location-info når komponenten monteres
    console.log("[AddHazard] Location ved oppstart:", location);
    if (location) {
      console.log("[AddHazard] Location detaljer:", {
        latitude: location.latitude,
        longitude: location.longitude,
        name: location.name,
        latitudeType: typeof location.latitude,
        longitudeType: typeof location.longitude
      });
    }
  }, [location]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)
      
      // Samle værdata hvis weather risk er inkludert
      let weatherRiskData = null;
      if (values.includeWeatherRisk && hasValidLocation) {
        try {
          // Hent værdata
          const timestamp = Date.now();
          const latNum = parseFloat(String(location?.latitude));
          const lonNum = parseFloat(String(location?.longitude));
          const formattedLat = latNum.toFixed(4);
          const formattedLon = lonNum.toFixed(4);
          
          const weatherResponse = await fetch(
            `/api/weather?lat=${formattedLat}&lon=${formattedLon}&t=${timestamp}`,
            { method: 'GET', cache: 'no-store' }
          );
          
          if (weatherResponse.ok) {
            const weatherData = await weatherResponse.json();
            
            // Bearbeid værdata for lagring
            if (weatherData.properties?.timeseries) {
              // Importer funksjoner fra WeatherMiniPreview-komponenten
              const groupForecastsByDay = (timeseries: any[]) => {
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
                const dailyForecasts: Array<{
                  date: string;
                  day: string;
                  symbolCode: string;
                  maxTemp: number;
                  minTemp: number;
                  maxWind: number;
                  totalPrecipitation: number;
                  riskLevel: 'high' | 'medium' | 'low';
                }> = [];
                
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
                      totalPrecipitation += f.data.next_6_hours.details.precipitation_amount / 6;
                    }
                  });
                  
                  // Velg symbolkode
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
                  
                  dailyForecasts.push({
                    date: date.toISOString(),
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
                return dailyForecasts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
              };
              
              // Behandle værdata
              const forecastData = groupForecastsByDay(weatherData.properties.timeseries.slice(0, 72)).slice(0, 3);
              
              // Lagre værdata i metadata
              weatherRiskData = {
                included: true,
                notes: values.weatherRiskNotes || "",
                timestamp: Date.now(),
                location: {
                  latitude: latNum,
                  longitude: lonNum,
                  name: location?.name || "Ukjent lokasjon"
                },
                forecasts: forecastData
              };
            }
          }
        } catch (error) {
          console.error("[AddHazard] Feil ved henting av værdata for lagring:", error);
          // Fortsett uten værdata
        }
      }
      
      console.log("Sender data:", {
        ...values,
        probability: parseInt(values.probability),
        severity: parseInt(values.severity),
        metadata: {
          weatherRisk: values.includeWeatherRisk ? (weatherRiskData || {
            included: true,
            notes: values.weatherRiskNotes || ""
          }) : undefined
        }
      });
      
      const response = await fetch(`/api/risk-assessments/${assessmentId}/hazards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          probability: parseInt(values.probability),
          severity: parseInt(values.severity),
          metadata: {
            weatherRisk: values.includeWeatherRisk ? (weatherRiskData || {
              included: true,
              notes: values.weatherRiskNotes || ""
            }) : undefined
          }
        }),
      });

      if (!response.ok) {
        const error = await response.json()
        console.error("Feil ved API-kall:", error);
        throw new Error(error.message || "Feil ved registrering av fare")
      }

      const result = await response.json();
      console.log("Fare lagt til:", result);

      toast.success("Fare lagt til", {
        description: "Faren ble registrert i risikovurderingen"
      })
      
      form.reset()
      onOpenChange(false)
      
      // Forbedret cache-invalidering med spesifikk queryKey
      queryClient.invalidateQueries({ 
        queryKey: ['riskAssessment', assessmentId]
      });
      
      // Sørg for at parent komponenten vet om endringen
      if (onHazardAdded) {
        setTimeout(() => {
          onHazardAdded();
        }, 100);
      }
    } catch (error) {
      console.error("Feil i onSubmit:", error);
      toast.error("Feil ved registrering", {
        description: error instanceof Error ? error.message : "Kunne ikke legge til fare"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Legg til fare
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Legg til ny fare</DialogTitle>
          <DialogDescription>
            Beskriv faren og vurder risikoen.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beskrivelse av fare</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Beskriv faren..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="consequence"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Konsekvens</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Beskriv mulige konsekvenser..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="probability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sannsynlighet</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Velg sannsynlighet" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent position="popper" className="z-[1000]">
                        <SelectItem value="1">1. Svært lite sannsynlig</SelectItem>
                        <SelectItem value="2">2. Lite sannsynlig</SelectItem>
                        <SelectItem value="3">3. Sannsynlig</SelectItem>
                        <SelectItem value="4">4. Meget sannsynlig</SelectItem>
                        <SelectItem value="5">5. Svært sannsynlig</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alvorlighetsgrad</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Velg alvorlighetsgrad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent position="popper" className="z-[1000]">
                        <SelectItem value="1">1. Ubetydelig</SelectItem>
                        <SelectItem value="2">2. Lav</SelectItem>
                        <SelectItem value="3">3. Moderat</SelectItem>
                        <SelectItem value="4">4. Alvorlig</SelectItem>
                        <SelectItem value="5">5. Svært alvorlig</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Værrisiko seksjon */}
            <div className="border rounded-md p-4 space-y-4">
              <div className="flex items-center gap-2">
                <CloudSun className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-medium">Værforhold</h3>
              </div>
              
              <FormField
                control={form.control}
                name="includeWeatherRisk"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!hasValidLocation}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Inkluder værforhold i risikovurderingen</FormLabel>
                      <FormDescription>
                        {hasValidLocation 
                          ? "Værforhold kan påvirke risikoen ved arbeidet" 
                          : <span className="text-red-500">Du må legge til en gyldig lokasjon i risikovurderingen for å vurdere værrisiko. Bruk lokasjonsikonet i øvre høyre hjørne.</span>}
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              {showWeatherPreview && hasValidLocation && (
                <FormField
                  control={form.control}
                  name="weatherRiskNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <CloudSun className="h-4 w-4" />
                        Vurdering av værforhold
                      </FormLabel>
                      <div className="mb-3">
                        {location && location.latitude !== null && location.longitude !== null ? (
                          <WeatherMiniPreview 
                            latitude={Number(location.latitude)} 
                            longitude={Number(location.longitude)} 
                            id={assessmentId}
                            locationName={location.name || "Valgt lokasjon"}
                          />
                        ) : (
                          <div className="bg-red-50 p-3 rounded-md">
                            <p className="text-sm text-red-600">Kunne ikke laste værdata. Koordinater mangler eller er ugyldige.</p>
                          </div>
                        )}
                      </div>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Legg til notater om hvordan værforholdene påvirker risikoen..." 
                          rows={2}
                        />
                      </FormControl>
                      <FormDescription>
                        Inkluder spesifikke værforhold som kan påvirke risikoen
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            
            <FormField
              control={form.control}
              name="existingMeasures"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Eksisterende tiltak</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Beskriv eksisterende tiltak..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Lagrer..." : "Legg til fare"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 