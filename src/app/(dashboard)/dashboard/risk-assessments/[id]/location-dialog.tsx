'use client'

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Search, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface Location {
  latitude: number | null
  longitude: number | null
  name?: string | null
}

interface LocationResult {
  display_name: string
  lat: string
  lon: string
}

interface LocationDialogProps {
  assessmentId: string
  location?: Location | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: () => Promise<void>
}

export function LocationDialog({ 
  assessmentId, 
  location,
  open, 
  onOpenChange,
  onUpdate
}: LocationDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [locationValues, setLocationValues] = useState<Location>({
    latitude: null,
    longitude: null,
    name: null
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<LocationResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  
  // Oppdater lokasjonsverdier når dialog åpnes eller lokasjon endres
  useEffect(() => {
    if (open) {
      console.log('Dialog åpnet, oppdaterer lokasjonsverdier:', location);
      if (location && typeof location.latitude === 'number' && typeof location.longitude === 'number') {
        setLocationValues({
          latitude: location.latitude,
          longitude: location.longitude,
          name: location.name || null
        })
      } else {
        setLocationValues({
          latitude: null,
          longitude: null,
          name: null
        })
      }
      setSearchTerm("")
      setSearchResults([])
    }
  }, [location, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!locationValues.latitude || !locationValues.longitude) {
      toast.error("Ugyldig lokasjon", {
        description: "Både breddegrad og lengdegrad må angis"
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      console.log('Sender lokasjonsdata:', locationValues)
      // Sikre at desimaltallene sendes med punktum, ikke komma, og at vi alltid har et stedsnavn
      const dataToSend = {
        latitude: Number(locationValues.latitude),
        longitude: Number(locationValues.longitude),
        name: locationValues.name || "Valgt lokasjon" // Fallback til et standardnavn hvis ikke angitt
      }
      
      console.log('Formatert data som sendes til API:', dataToSend);
      
      // Legg til en cachebuster parameter for å unngå caching
      const timestamp = Date.now();
      const cacheBuster = `?t=${timestamp}`;
      
      const response = await fetch(`/api/dashboard/risk-assessments/${assessmentId}/location${cacheBuster}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify(dataToSend)
      })
      
      if (!response.ok) {
        throw new Error('Feil ved oppdatering av lokasjon')
      }
      
      toast.success("Lokasjon oppdatert", {
        description: "Lokasjonsinformasjonen er lagret"
      })
      
      // Kjør onUpdate med en liten forsinkelse for å sikre at endringene er lagret
      setTimeout(async () => {
        await onUpdate()
        onOpenChange(false)
      }, 100);
    } catch (error) {
      console.error('Feil ved oppdatering av lokasjon:', error)
      toast.error("Feil", {
        description: "Kunne ikke oppdatere lokasjon"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          // Konverter til Number for å sikre riktig formatering
          const lat = Number(position.coords.latitude);
          const lng = Number(position.coords.longitude);
          
          console.log('Hentet posisjon:', lat, lng);
          
          // Prøv å hente stedsnavn basert på koordinater ved reverse geocoding
          let placeName = "Din posisjon";
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14`,
              {
                headers: {
                  'Accept-Language': 'no,nb,nn,en',
                  'User-Agent': 'HMS-Nova-App/1.0'
                }
              }
            );
            
            if (response.ok) {
              const data = await response.json();
              if (data.display_name) {
                placeName = data.display_name;
              }
            }
          } catch (error) {
            console.error('Feil ved reverse geocoding:', error);
          }
          
          setLocationValues({
            latitude: lat,
            longitude: lng,
            name: placeName
          })
          
          toast.success("Posisjon funnet", {
            description: `Posisjon hentet: ${placeName}`
          })
        },
        (error) => {
          console.error('Feil ved lokalisering:', error)
          toast.error("Kunne ikke hente posisjon", {
            description: error.message
          })
        }
      )
    } else {
      toast.error("Denne nettleseren støtter ikke geolokalisering")
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'latitude' | 'longitude') => {
    // Erstatt alle komma med punktum for å sikre riktig formatering
    const rawValue = e.target.value.replace(/,/g, '.')
    const value = rawValue ? parseFloat(rawValue) : null
    
    setLocationValues(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const formatCoordinate = (value: number | null): string => {
    if (value === null) return '';
    // Sikre at desimaltall alltid vises med punktum, ikke komma
    return value.toString().replace(/,/g, '.');
  }

  // Nytt: Søk etter stedsnavn
  const searchLocation = async (query: string) => {
    if (!query || query.length < 3) return;
    
    setIsSearching(true);
    try {
      // Bruk OpenStreetMap Nominatim API for å konvertere stedsnavn til koordinater
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
        {
          headers: {
            'Accept-Language': 'no,nb,nn,en',
            'User-Agent': 'HMS-Nova-App/1.0'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Kunne ikke søke etter stedsnavn');
      }
      
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Feil ved stedsnavnsøk:', error);
      toast.error('Kunne ikke søke etter stedsnavn');
    } finally {
      setIsSearching(false);
    }
  };

  // Håndter valg av stedsnavn
  const handleSelectLocation = (result: LocationResult) => {
    setLocationValues({
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      name: result.display_name
    });
    
    setSearchTerm(result.display_name);
    setIsPopoverOpen(false);
    
    toast.success('Lokasjon valgt', {
      description: `Valgt lokasjon: ${result.display_name}`
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Rediger lokasjon</DialogTitle>
            <DialogDescription>
              Angi GPS-koordinater eller søk etter sted for denne risikovurderingen
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Nytt: Stedsnavnsøk */}
            <div className="space-y-2">
              <Label htmlFor="location-search">Søk etter sted</Label>
              <div className="flex space-x-2">
                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                  <PopoverTrigger asChild>
                    <div className="flex-1 relative">
                      <Input
                        id="location-search"
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          if (e.target.value.length >= 3) {
                            setIsPopoverOpen(true);
                            searchLocation(e.target.value);
                          }
                        }}
                        placeholder="Søk etter stedsnavn..."
                        className="w-full pr-10"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        {isSearching ? (
                          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                        ) : (
                          <Search className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-[400px]" align="start">
                    <Command>
                      <CommandList>
                        {searchResults.length === 0 && !isSearching ? (
                          <CommandEmpty>Ingen steder funnet</CommandEmpty>
                        ) : (
                          <CommandGroup heading="Søkeresultater">
                            {isSearching ? (
                              <div className="flex items-center justify-center p-4">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                <span>Søker...</span>
                              </div>
                            ) : (
                              searchResults.map((result) => (
                                <CommandItem
                                  key={result.display_name}
                                  onSelect={() => handleSelectLocation(result)}
                                  className="flex flex-col items-start"
                                >
                                  <div className="font-medium">{result.display_name.split(",")[0]}</div>
                                  <div className="text-sm text-gray-500 truncate w-full">
                                    {result.display_name}
                                  </div>
                                </CommandItem>
                              ))
                            )}
                          </CommandGroup>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <p className="text-sm text-gray-500">
                Skriv minst 3 tegn for å søke etter steder
              </p>
            </div>
            
            {/* Eksisterende koordinat-inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Breddegrad</Label>
                <Input
                  id="latitude"
                  type="text"
                  inputMode="decimal"
                  value={formatCoordinate(locationValues.latitude)}
                  onChange={(e) => handleInputChange(e, 'latitude')}
                  placeholder="f.eks. 59.911491"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Lengdegrad</Label>
                <Input
                  id="longitude"
                  type="text"
                  inputMode="decimal"
                  value={formatCoordinate(locationValues.longitude)}
                  onChange={(e) => handleInputChange(e, 'longitude')}
                  placeholder="f.eks. 10.757933"
                />
              </div>
            </div>
            
            <Button 
              type="button"
              variant="outline"
              onClick={handleGetCurrentLocation}
              className="w-full flex items-center justify-center gap-2"
            >
              <MapPin className="h-4 w-4" />
              Bruk min nåværende posisjon
            </Button>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="mr-2">
              Avbryt
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Lagrer..." : "Lagre lokasjon"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 