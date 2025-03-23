'use client'

import React, { useState, useEffect, useRef } from "react"
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
import { MapPin, Search, Loader2, Navigation, Map, PanelLeftOpen } from "lucide-react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useQueryClient } from '@tanstack/react-query'

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
  sjaId: string
  location?: Location | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: () => Promise<void>
  onLocationSelect?: (location: { latitude: number, longitude: number, name: string }) => void
}

export function LocationDialog({ 
  sjaId, 
  location,
  open, 
  onOpenChange,
  onUpdate,
  onLocationSelect
}: LocationDialogProps) {
  const [activeTab, setActiveTab] = useState<string>("search")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [locationValues, setLocationValues] = useState<Location>({
    latitude: null,
    longitude: null,
    name: null
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<LocationResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [directSearchTerm, setDirectSearchTerm] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [directSearchQuery, setDirectSearchQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [map, setMap] = useState<any | null>(null)
  const [marker, setMarker] = useState<any | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const [weatherData, setWeatherData] = useState<any | null>(null)
  const [isLoadingWeather, setIsLoadingWeather] = useState(false)
  const queryClient = useQueryClient()
  
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
        // Reset søkeverdier
        setSearchTerm(location.name || "")
        setDirectSearchTerm("")
      } else {
        setLocationValues({
          latitude: null,
          longitude: null,
          name: null
        })
        setSearchTerm("")
        setDirectSearchTerm("")
      }
      setSearchResults([])
    }
  }, [location, open])

  // Oppdater searchTerm-håndtering for å unngå state-oppdateringer under rendering
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.length >= 3) {
        setSearchQuery(searchTerm);
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Bruk useEffect for å håndtere søk når søketermen endres
  useEffect(() => {
    const handleSearch = async () => {
      if (searchQuery && searchQuery.length >= 3) {
        await searchLocation(searchQuery);
      }
    };
    
    handleSearch();
  }, [searchQuery]);

  // Ny useEffect for direktesøk
  useEffect(() => {
    const handleDirectSearch = async () => {
      if (directSearchQuery && directSearchQuery.length >= 3) {
        await performDirectSearch(directSearchQuery);
      }
    };
    
    if (directSearchQuery) {
      handleDirectSearch();
    }
  }, [directSearchQuery]);

  // Oppdater direktesøk-håndtering for å unngå state-oppdateringer under rendering
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (directSearchTerm.length >= 3 && directSearchQuery === directSearchTerm) {
        // Ikke gjør noe - allerede søkt
      } else if (directSearchTerm.length >= 3) {
        setDirectSearchQuery(directSearchTerm);
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [directSearchTerm, directSearchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Hent værdata først
      const weatherResponse = await fetch(`/api/weather?lat=${locationValues.latitude}&lon=${locationValues.longitude}&t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });

      if (!weatherResponse.ok) {
        throw new Error('Kunne ikke hente værdata');
      }

      const weatherData = await weatherResponse.json();
      
      if (!weatherData || !weatherData.forecasts) {
        throw new Error('Ugyldig værdata mottatt');
      }

      console.log('Hentet værdata:', weatherData);

      // Hvis dette er en ny SJA, bare oppdater lokasjonsverdiene og kall onLocationSelect
      if (sjaId === "new") {
        if (onLocationSelect) {
          onLocationSelect({
            latitude: locationValues.latitude!,
            longitude: locationValues.longitude!,
            name: locationValues.name || "Valgt lokasjon"
          });
        }
        onOpenChange(false);
        toast.success('Lokasjon lagt til i skjemaet', {
          description: `${locationValues.name || 'Lokasjon'} er registrert med værdata`
        });
        return;
      }
      
      // For eksisterende SJA, oppdater lokasjonen i databasen
      const response = await fetch(`/api/sja/${sjaId}/location`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: locationValues.latitude,
          longitude: locationValues.longitude,
          name: locationValues.name,
          weatherData: {
            forecasts: weatherData.forecasts,
            properties: weatherData.properties,
            _metadata: weatherData._metadata
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Kunne ikke oppdatere lokasjon');
      }

      const result = await response.json();
      console.log('Lokasjonsoppdatering resultat:', result);

      // Invalider React Query cache for å sikre oppdaterte data
      if (sjaId && sjaId !== "new") {
        // Invalider både SJA-detalj, SJA-liste og værdata-cachen
        queryClient.invalidateQueries({ queryKey: ['sja-detail', sjaId] });
        queryClient.invalidateQueries({ queryKey: ['sja-list'] });
        queryClient.invalidateQueries({ 
          queryKey: ['weather', locationValues.latitude, locationValues.longitude, sjaId] 
        });
      }

      onUpdate();
      onOpenChange(false);
      toast.success('Lokasjon oppdatert', {
        description: `${locationValues.name || 'Lokasjon'} er registrert med værdata`
      });
      
    } catch (error) {
      console.error('Feil ved oppdatering av lokasjon:', error);
      toast.error('Kunne ikke oppdatere lokasjon', {
        description: error instanceof Error ? error.message : 'Ukjent feil'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
          
          // Oppdater søkeverdien for visning
          setSearchTerm(placeName)
          
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

  // Oppdatert direktesøk implementasjon
  const performDirectSearch = async (query: string) => {
    if (!query || query.length < 3) return;
    
    setIsSearching(true);
    try {
      // Bruk OpenStreetMap Nominatim API for å konvertere stedsnavn til koordinater
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
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
      
      if (data && data.length > 0) {
        const result = data[0];
        // Bruk lokale variabler for verdier vi vil oppdatere
        const newLocationValues = {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
          name: result.display_name
        };
        
        // Oppdater state en gang med alle verdiene
        setLocationValues(newLocationValues);
        setSearchTerm(result.display_name);
        
        toast.success('Lokasjon funnet', {
          description: `Funnet lokasjon: ${result.display_name}`
        });
      } else {
        toast.error('Fant ingen steder', {
          description: `Fant ingen steder som matcher "${query}"`
        });
      }
    } catch (error) {
      console.error('Feil ved stedsnavnsøk:', error);
      toast.error('Kunne ikke søke etter stedsnavn');
    } finally {
      setIsSearching(false);
    }
  };

  // Oppdatert handleDirectSearch som på trygg måte setter direktesøkeord
  const handleDirectSearch = () => {
    if (!directSearchTerm || directSearchTerm.length < 3) {
      toast.error("For kort søkestreng", { description: "Skriv minst 3 tegn for å søke" });
      return;
    }
    
    // Sett state på en trygg måte - useEffect vil fange opp endringen og utføre søket
    setDirectSearchQuery(directSearchTerm);
  };

  // Søk etter stedsnavn
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
    // Bruk lokale variabler for verdier vi vil oppdatere
    const newLocationValues = {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      name: result.display_name
    };
    
    // Oppdater state en gang med alle verdiene
    setLocationValues(newLocationValues);
    setSearchTerm(result.display_name);
    
    toast.success('Lokasjon valgt', {
      description: `Valgt lokasjon: ${result.display_name}`
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {sjaId === "new" 
                ? "Legg til lokasjon for værdata" 
                : "Rediger lokasjon for SJA"}
            </DialogTitle>
            <DialogDescription>
              {sjaId === "new"
                ? "Velg lokasjon for å vise værdata i SJA-skjemaet. Ingen data lagres før du fullfører SJA-opprettelsen."
                : "Søk etter et sted eller angi GPS-koordinater for denne sikre jobbanalysen"}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="search" className="flex items-center gap-1">
                <Search className="h-4 w-4" />
                <span>Stedssøk</span>
              </TabsTrigger>
              <TabsTrigger value="direct" className="flex items-center gap-1">
                <Map className="h-4 w-4" />
                <span>Direktesøk</span>
              </TabsTrigger>
              <TabsTrigger value="coordinates" className="flex items-center gap-1">
                <Navigation className="h-4 w-4" />
                <span>Koordinater</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Stedssøk-fane */}
            <TabsContent value="search" className="space-y-4 pt-4">
              <div>
                <Label htmlFor="location-search">Søk etter sted</Label>
                <div className="relative mt-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <div className="flex-1 relative">
                        <Input
                          id="location-search"
                          value={searchTerm}
                          onChange={(e) => {
                            // Oppdater kun searchTerm i onChange, useEffect håndterer søket
                            setSearchTerm(e.target.value);
                          }}
                          placeholder="Søk etter stedsnavn..."
                          className="w-full pr-10"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          {isSearching ? (
                            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                          ) : (
                            <Search className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </PopoverTrigger>
                    {searchResults.length > 0 && (
                      <PopoverContent className="p-0 w-[400px] max-h-[300px] overflow-auto" align="start" side="bottom">
                        <Command>
                          <CommandList>
                            <CommandGroup heading="Søkeresultater">
                              {searchResults.map((result) => (
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
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    )}
                  </Popover>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Skriv minst 3 tegn og velg fra resultatlisten
                </p>
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
              
              {locationValues.latitude && locationValues.longitude && (
                <div className="p-4 bg-gray-50 rounded-md mt-4">
                  <div className="text-sm font-medium">Valgt lokasjon:</div>
                  <div className="text-sm mt-1">{locationValues.name || "Ukjent sted"}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Koordinater: {locationValues.latitude.toFixed(6)}, {locationValues.longitude.toFixed(6)}
                  </div>
                </div>
              )}
            </TabsContent>
            
            {/* Direktesøk-fane */}
            <TabsContent value="direct" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="direct-search">Søk direkte etter stedsnavn</Label>
                <div className="flex space-x-2">
                  <Input
                    id="direct-search"
                    value={directSearchTerm}
                    onChange={(e) => setDirectSearchTerm(e.target.value)}
                    placeholder="F.eks. Oslo, Trondheim, Lofoten..."
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    onClick={handleDirectSearch}
                    disabled={isSearching || directSearchTerm.length < 3}
                  >
                    {isSearching ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Search className="h-4 w-4 mr-2" />
                    )}
                    Søk
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  Skriv inn stedsnavn eller adresse og trykk søk
                </p>
              </div>
              
              {locationValues.latitude && locationValues.longitude && (
                <div className="p-4 bg-gray-50 rounded-md mt-4">
                  <div className="text-sm font-medium">Valgt lokasjon:</div>
                  <div className="text-sm mt-1">{locationValues.name || "Ukjent sted"}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Koordinater: {locationValues.latitude.toFixed(6)}, {locationValues.longitude.toFixed(6)}
                  </div>
                </div>
              )}
            </TabsContent>
            
            {/* Koordinater-fane */}
            <TabsContent value="coordinates" className="space-y-4 pt-4">
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
              
              <div className="space-y-2">
                <Label htmlFor="name">Stedsnavn (valgfritt)</Label>
                <Input
                  id="name"
                  type="text"
                  value={locationValues.name || ''}
                  onChange={(e) => setLocationValues(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="f.eks. Oslo sentrum"
                />
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="mr-2">
              Avbryt
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || (!locationValues.latitude || !locationValues.longitude)}
            >
              {isSubmitting ? "Lagrer..." : sjaId === "new" ? "Legg til lokasjon i skjema" : "Lagre lokasjon"}
            </Button>
          </DialogFooter>
          
          {sjaId === "new" && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              <strong>Merk:</strong> Dette vil kun legge til lokasjonen i SJA-skjemaet. 
              Ingen data sendes til serveren og SJA-en vil først bli lagret når du klikker "Lagre" i hovedskjemaet.
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
} 