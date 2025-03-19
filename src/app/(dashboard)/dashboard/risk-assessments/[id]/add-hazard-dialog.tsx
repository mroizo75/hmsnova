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
  location?: { 
    latitude: number | null
    longitude: number | null
    name?: string | null
  } | null;
}

export function AddHazardDialog({ assessmentId, open, onOpenChange, location }: AddHazardDialogProps) {
  const router = useRouter()
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

  // Vis værprognoser når brukeren velger å inkludere værvurdering
  useEffect(() => {
    const includeWeather = form.watch("includeWeatherRisk");
    console.log("[AddHazard] includeWeatherRisk endret til:", includeWeather);
    console.log("[AddHazard] Location info:", location ? 
      `latitude: ${location.latitude}, longitude: ${location.longitude}` : 
      "Ingen lokasjon tilgjengelig");
    setShowWeatherPreview(includeWeather);
  }, [form.watch("includeWeatherRisk"), location]);

  // Legg til loggføring for å se hva som sendes inn
  useEffect(() => {
    // Logg location-info når komponenten monteres
    console.log("[AddHazard] Location ved oppstart:", location);
    if (location) {
      console.log("[AddHazard] Location properties:", {
        latitude: typeof location.latitude,
        longitude: typeof location.longitude,
        name: typeof location.name,
        nameValue: location.name
      });
    }
  }, [location]);

  // Mer robust sjekk for gyldig lokasjon med riktig geografisk område
  const hasValidLocation = (() => {
    // Hvis location er null eller undefined, er det ikke gyldig
    if (!location) return false;
    
    // Sjekk om latitude og longitude finnes
    const hasLatitude = location.latitude !== null && location.latitude !== undefined;
    const hasLongitude = location.longitude !== null && location.longitude !== undefined;
    
    if (!hasLatitude || !hasLongitude) return false;
    
    // Konverter til tall
    const latNum = Number(location.latitude);
    const lonNum = Number(location.longitude);
    
    // Sjekk om tallene er gyldige og innenfor gyldig geografisk område
    return !isNaN(latNum) && !isNaN(lonNum) && 
           latNum >= -90 && latNum <= 90 && 
           lonNum >= -180 && lonNum <= 180;
  })();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)
      console.log("Sender data:", {
        ...values,
        probability: parseInt(values.probability),
        severity: parseInt(values.severity),
        hasLocation: hasValidLocation
      })
      
      const response = await fetch(`/api/risk-assessments/${assessmentId}/hazards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          probability: parseInt(values.probability),
          severity: parseInt(values.severity),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error("Feil ved API-kall:", error);
        throw new Error(error.message || "Feil ved registrering av fare")
      }

      toast.success("Fare lagt til", {
        description: "Faren ble registrert i risikovurderingen"
      })
      
      form.reset()
      onOpenChange(false)
      router.refresh()
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
                          : "Du må legge til lokasjon i risikovurderingen for å vurdere værrisiko"}
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
                        <WeatherMiniPreview 
                          latitude={Number(location!.latitude)} 
                          longitude={Number(location!.longitude)} 
                          id={assessmentId} 
                          locationName={location?.name || "Valgt lokasjon"}
                        />
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