'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  AlertTriangle, CloudRain, Snowflake, Sun, Wind, 
  ThermometerSun, Thermometer, RefreshCw, RefreshCcw, 
  MapPin, Search
} from 'lucide-react'
import { format, isSameDay, parseISO } from 'date-fns'
import { nb } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'

interface WeatherForecastProps {
  // Tar ikke lenger inn koordinater som props, henter dem selv
  initialLatitude?: number | null
  initialLongitude?: number | null
  initialLocationName?: string | null
}

interface Location {
  latitude: number
  longitude: number
  name?: string
}

interface TimeSeries {
  time: string
  data: {
    instant: {
      details: {
        air_temperature: number
        wind_speed: number
        relative_humidity: number
        precipitation_amount?: number
      }
    }
    next_1_hours?: {
      summary: {
        symbol_code: string
      }
      details: {
        precipitation_amount: number
      }
    }
    next_6_hours?: {
      summary: {
        symbol_code: string
      }
      details: {
        precipitation_amount: number
      }
    }
  }
}

// Grupperer værdata etter dato
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

// Funksjon for å hente værdata direkte
async function fetchWeatherData(latitude: number, longitude: number) {
  try {
    // Unngå caching ved å legge til timestamp
    const timestamp = Date.now();
    
    // Bruk standard fetch med cache: 'no-store'
    const response = await fetch(
      `/api/weather?lat=${latitude}&lon=${longitude}&t=${timestamp}`,
      {
        method: 'GET',
        cache: 'no-store'
      }
    );
    
    if (!response.ok) {
      throw new Error(`Værdata kunne ikke hentes: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Feil ved henting av værdata:', error);
    throw error;
  }
}

export function WeatherForecast({ initialLatitude, initialLongitude, initialLocationName }: WeatherForecastProps) {
  // Logg initialLocationName for debugging
  console.log(`[WeatherForecast] Received initialLocationName: "${initialLocationName}", type: ${typeof initialLocationName}`);
  
  // Legg til en ref for å spore om initialLocationName har endret seg
  const prevPropsRef = useRef<{
    lat?: number | null, 
    lng?: number | null, 
    name?: string | null
  }>({});
  
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    initialLatitude && initialLongitude 
      ? { 
          latitude: initialLatitude, 
          longitude: initialLongitude,
          name: initialLocationName || undefined
        } 
      : null
  );

  // Input-felter for manuell lokasjon
  const [manualLatitude, setManualLatitude] = useState<string>('');
  const [manualLongitude, setManualLongitude] = useState<string>('');
  const [showLocationInput, setShowLocationInput] = useState(false);

  // Bruk React Query bare når vi har en lokasjon
  const { 
    data, 
    error, 
    isLoading, 
    isError,
    refetch,
    isFetching,
    dataUpdatedAt
  } = useQuery({
    queryKey: ['weather', selectedLocation?.latitude, selectedLocation?.longitude],
    queryFn: () => selectedLocation 
      ? fetchWeatherData(selectedLocation.latitude, selectedLocation.longitude)
      : Promise.reject('Ingen lokasjon valgt'),
    enabled: !!selectedLocation,
    staleTime: 1000 * 60 * 15, // 15 minutter
    refetchInterval: 1000 * 60 * 30, // Oppdater hver 30. minutt
    retry: 1,
  });
  
  // Behandle data til daglige prognoser
  const dailyForecasts = data?.properties?.timeseries 
    ? groupForecastsByDay(data.properties.timeseries.slice(0, 72)).slice(0, 3) 
    : null;
  
  // Funksjon for å hente nåværende posisjon via geolocation
  const handleGetCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      toast.info("Henter din nåværende posisjon...");
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = Number(position.coords.latitude);
          const lng = Number(position.coords.longitude);
          
          setSelectedLocation({
            latitude: lat,
            longitude: lng,
            name: initialLocationName || 'Din nåværende posisjon'
          });
          
          toast.success("Posisjon funnet", {
            description: "Værdata hentes for din nåværende posisjon"
          });
        },
        (error) => {
          console.error('Feil ved lokalisering:', error);
          toast.error("Kunne ikke hente posisjon", {
            description: error.message
          });
          setShowLocationInput(true);
        }
      );
    } else {
      toast.error("Denne nettleseren støtter ikke geolokalisering");
      setShowLocationInput(true);
    }
  }, [initialLocationName]);

  // Funksjon for å oppdatere lokasjon manuelt
  const handleManualLocation = () => {
    const lat = parseFloat(manualLatitude.replace(',', '.'));
    const lng = parseFloat(manualLongitude.replace(',', '.'));
    
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      toast.error("Ugyldige koordinater", {
        description: "Breddegrad må være mellom -90 og 90, lengdegrad mellom -180 og 180"
      });
      return;
    }
    
    setSelectedLocation({
      latitude: lat,
      longitude: lng,
      name: 'Angitt posisjon'
    });
    
    toast.success("Posisjon satt", {
      description: "Værdata hentes for angitt posisjon"
    });
  };
  
  // Funksjon for manuell oppdatering
  const handleRefresh = () => {
    refetch();
  };
  
  // Funksjon for å gruppere værdata etter dag
  function groupForecastsByDay(timeseries: TimeSeries[]): DailyForecast[] {
    const dailyData: Map<string, TimeSeries[]> = new Map()
    
    // Gruppere alle timeseries etter dato
    timeseries.forEach(item => {
      const date = parseISO(item.time)
      const dateKey = format(date, 'yyyy-MM-dd')
      
      if (!dailyData.has(dateKey)) {
        dailyData.set(dateKey, [])
      }
      
      dailyData.get(dateKey)?.push(item)
    })
    
    // Opprette daglige prognoser
    const result: DailyForecast[] = []
    
    dailyData.forEach((dayForecasts, dateKey) => {
      // Finn temperaturer og vind
      const temperatures = dayForecasts.map(f => f.data.instant.details.air_temperature)
      const winds = dayForecasts.map(f => f.data.instant.details.wind_speed)
      
      // Finn nedbør (samlet for dagen)
      let totalPrecipitation = 0
      dayForecasts.forEach(f => {
        if (f.data.next_1_hours) {
          totalPrecipitation += f.data.next_1_hours.details.precipitation_amount
        } else if (f.data.next_6_hours) {
          totalPrecipitation += f.data.next_6_hours.details.precipitation_amount / 6 // Fordel over timer
        }
      })
      
      // Velg en representativ symbol kode for dagen (helst fra midt på dagen)
      const afternoonForecast = dayForecasts.find(f => {
        const hour = parseISO(f.time).getHours()
        return hour >= 12 && hour <= 15
      })
      
      const symbolCode = afternoonForecast?.data.next_1_hours?.summary.symbol_code || 
                         dayForecasts[0]?.data.next_1_hours?.summary.symbol_code ||
                         'clearsky_day';
      
      const date = parseISO(dateKey)
      const maxTemp = Math.max(...temperatures)
      const minTemp = Math.min(...temperatures)
      const maxWind = Math.max(...winds)
      
      // Vurder værrisiko
      let riskLevel: 'high' | 'medium' | 'low' = 'low'
      if (maxWind > 15 || totalPrecipitation > 5 || minTemp < -10 || maxTemp > 30) {
        riskLevel = 'high'
      } else if (maxWind > 8 || totalPrecipitation > 1 || minTemp < 0 || maxTemp > 25) {
        riskLevel = 'medium'
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
      })
    })
    
    // Sorter etter dato
    return result.sort((a, b) => a.date.getTime() - b.date.getTime())
  }
  
  // Funksjon for å bestemme værtype-ikon
  function getWeatherIcon(symbolCode: string, size = "small") {
    const iconSize = size === "large" ? "h-6 w-6" : "h-5 w-5"
    
    if (symbolCode.includes('rain')) {
      return <CloudRain className={`${iconSize} text-blue-500`} />
    } else if (symbolCode.includes('snow')) {
      return <Snowflake className={`${iconSize} text-blue-200`} />
    } else if (symbolCode.includes('clear')) {
      return <Sun className={`${iconSize} text-yellow-500`} />
    } else if (symbolCode.includes('cloud')) {
      return <CloudRain className={`${iconSize} text-gray-500`} strokeWidth={1} />
    } else {
      return <Sun className={`${iconSize} text-yellow-500`} />
    }
  }
  
  // Funksjon for å vise værrisiko badge
  function getWeatherRiskBadge(riskLevel: 'high' | 'medium' | 'low', size = "small") {
    const textSize = size === "large" ? "text-sm" : "text-xs"
    
    if (riskLevel === 'high') {
      return <Badge variant="destructive" className={`${textSize} flex items-center gap-1`}>
        <AlertTriangle className="h-3 w-3" />
        <span>Høy risiko</span>
      </Badge>
    } else if (riskLevel === 'medium') {
      return <Badge variant="warning" className={`${textSize} flex items-center gap-1`}>
        <AlertTriangle className="h-3 w-3" />
        <span>Moderat</span>
      </Badge>
    } else {
      return <Badge variant="outline" className={`${textSize} text-green-600 border-green-600`}>
        <span>Lav risiko</span>
      </Badge>
    }
  }
  
  // Formater tidspunkt for siste oppdatering
  const formattedLastUpdated = dataUpdatedAt 
    ? new Date(dataUpdatedAt).toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' })
    : '-'
  
  // Hvis vi ikke har en lokasjon, vis en melding om å velge lokasjon
  if (!selectedLocation) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Værprognose {(initialLocationName || "for valgt lokasjon") && 
              <span>for {initialLocationName || "valgt lokasjon"}</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              For å vise værprognose, trenger vi din posisjon.
            </p>
            
            {!showLocationInput ? (
              <Button 
                onClick={handleGetCurrentLocation} 
                className="w-full flex items-center justify-center gap-2"
              >
                <MapPin className="h-4 w-4" />
                Bruk min posisjon
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Input 
                      placeholder="Breddegrad (f.eks. 59.91)" 
                      value={manualLatitude}
                      onChange={(e) => setManualLatitude(e.target.value)}
                    />
                  </div>
                  <div>
                    <Input 
                      placeholder="Lengdegrad (f.eks. 10.75)" 
                      value={manualLongitude}
                      onChange={(e) => setManualLongitude(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleManualLocation} 
                    className="flex-1"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Bruk denne posisjonen
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleGetCurrentLocation}
                  >
                    <MapPin className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            
            <p className="text-xs text-gray-500">
              Værdata hentes fra Meteorologisk institutt (MET). 
              Din posisjon brukes kun lokalt for å hente værdata.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Erstatt useEffect med denne versjonen som ikke har selectedLocation som avhengighet
  useEffect(() => {
    // Sjekk om verdiene faktisk har endret seg for å unngå uendelig løkke
    const hasChanged = 
      prevPropsRef.current.lat !== initialLatitude || 
      prevPropsRef.current.lng !== initialLongitude || 
      prevPropsRef.current.name !== initialLocationName;
    
    if (initialLatitude && initialLongitude && hasChanged) {
      console.log(`[WeatherForecast] Oppdaterer selectedLocation med nye verdier, initialLocationName: ${initialLocationName}`);
      
      // Oppdater selectedLocation
      setSelectedLocation({
        latitude: initialLatitude,
        longitude: initialLongitude,
        name: initialLocationName || undefined
      });
      
      // Oppdater ref med nåværende verdier
      prevPropsRef.current = {
        lat: initialLatitude,
        lng: initialLongitude,
        name: initialLocationName
      };
    }
  }, [initialLatitude, initialLongitude, initialLocationName]); // Fjernet selectedLocation

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Værdata laster...</CardTitle>
          <CardDescription>Henter værprognoser</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </CardContent>
      </Card>
    )
  }
  
  if (error) {
    console.error('[Weather] Feil ved henting av værdata:', error);
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center gap-2">
              <CloudRain className="h-5 w-5" />
              Værprognose
            </CardTitle>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCcw className="h-4 w-4 mr-1" />
              Oppdater
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-red-500 p-3 text-sm">
            <p>Kunne ikke hente værdata. Vennligst prøv igjen senere.</p>
            <div className="flex mt-4 gap-2">
              <Button variant="outline" onClick={() => setSelectedLocation(null)}>
                <MapPin className="h-4 w-4 mr-1" />
                Velg ny posisjon
              </Button>
              <Button onClick={handleRefresh}>
                <RefreshCcw className="h-4 w-4 mr-1" />
                Prøv igjen
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            <CloudRain className="h-5 w-5" />
            Værprognose <span>for {selectedLocation?.name || "valgt lokasjon"}</span>
          </CardTitle>
          <div className="flex gap-2">
            <Button onClick={() => setSelectedLocation(null)} variant="outline" size="sm">
              <MapPin className="h-4 w-4 mr-1" />
              Endre posisjon
            </Button>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCcw className="h-4 w-4 mr-1" />
              Oppdater
            </Button>
          </div>
        </div>
        <CardDescription className="flex justify-between items-center">
          <span>
            Værdata for {selectedLocation?.name || "valgt lokasjon"}
          </span>
          <span className="text-xs text-gray-400">Oppdatert {formattedLastUpdated}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {dailyForecasts && dailyForecasts.length > 0 ? (
          <div className="space-y-2">
            {/* Mobile layout (stacked) */}
            <div className="block sm:hidden space-y-2">
              {dailyForecasts.map((day, index) => (
                <div key={`${index}-${dataUpdatedAt}-mobile`} 
                     className={`border rounded-md p-3 ${day.riskLevel === 'high' ? 'border-red-200 bg-red-50' : 
                                day.riskLevel === 'medium' ? 'border-yellow-200 bg-yellow-50' : 
                                'border-green-200 bg-green-50'}`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {getWeatherIcon(day.symbolCode, "large")}
                      <div>
                        <div className="font-medium capitalize">
                          {format(day.date, 'EEEE', { locale: nb })} {format(day.date, 'd. MMM', { locale: nb })}
                          {isSameDay(day.date, new Date()) && 
                           <span className="ml-1 text-green-600">(i dag)</span>}
                        </div>
                        <div className="flex items-center text-sm mt-1">
                          <Thermometer className="h-4 w-4 text-blue-500 mr-1" />
                          <span>{day.minTemp.toFixed(0)}°</span>
                          <span className="mx-1">-</span>
                          <ThermometerSun className="h-4 w-4 text-red-500 mr-1" />
                          <span>{day.maxTemp.toFixed(0)}°</span>
                        </div>
                      </div>
                    </div>
                    <div>{getWeatherRiskBadge(day.riskLevel, "large")}</div>
                  </div>
                  
                  <div className="flex mt-2 justify-between">
                    <div className="flex items-center">
                      <Wind className="h-4 w-4 text-gray-500 mr-1" />
                      <span>{day.maxWind.toFixed(1)} m/s</span>
                    </div>
                    <div className="flex items-center">
                      <CloudRain className="h-4 w-4 text-blue-500 mr-1" />
                      <span>{day.totalPrecipitation.toFixed(1)} mm nedbør</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Tablet layout (2-column grid) */}
            <div className="hidden sm:grid md:hidden grid-cols-2 gap-3">
              {dailyForecasts.map((day, index) => (
                <div key={`${index}-${dataUpdatedAt}-tablet`} 
                     className={`border rounded-md p-2 ${day.riskLevel === 'high' ? 'border-red-200 bg-red-50' : 
                                day.riskLevel === 'medium' ? 'border-yellow-200 bg-yellow-50' : 
                                'border-green-200 bg-green-50'}`}>
                  <div className="text-sm font-medium flex justify-between items-center">
                    <span className="capitalize">
                      {day.day} {format(day.date, 'd.MM', { locale: nb })}
                      {isSameDay(day.date, new Date()) && 
                       <span className="ml-1 text-green-600">(i dag)</span>}
                    </span>
                    <div>{getWeatherRiskBadge(day.riskLevel)}</div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-1">
                    <div className="flex items-center gap-1">
                      {getWeatherIcon(day.symbolCode)}
                      <div className="flex items-center text-sm">
                        <Thermometer className="h-3 w-3 text-blue-500 mr-0.5" />
                        <span>{day.minTemp.toFixed(0)}°</span>
                        <span className="mx-0.5">-</span>
                        <ThermometerSun className="h-3 w-3 text-red-500 mr-0.5" />
                        <span>{day.maxTemp.toFixed(0)}°</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col text-xs text-right">
                      <div className="flex items-center justify-end">
                        <Wind className="h-3 w-3 text-gray-500 mr-0.5" />
                        <span>{day.maxWind.toFixed(0)} m/s</span>
                      </div>
                      <div className="flex items-center justify-end">
                        <CloudRain className="h-3 w-3 text-blue-500 mr-0.5" />
                        <span>{day.totalPrecipitation.toFixed(0)} mm</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Desktop layout (én dag per rad med bedre layout) */}
            <div className="hidden md:block space-y-3">
              {dailyForecasts.map((day, index) => (
                <div key={`${index}-${dataUpdatedAt}-desktop`} 
                     className={`border rounded-md p-3 ${day.riskLevel === 'high' ? 'border-red-200 bg-red-50' : 
                                day.riskLevel === 'medium' ? 'border-yellow-200 bg-yellow-50' : 
                                'border-green-200 bg-green-50'}`}>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-2 md:space-y-0">
                    <div className="flex items-center gap-3">
                      {getWeatherIcon(day.symbolCode, "large")}
                      <div>
                        <span className="font-medium capitalize">
                          {format(day.date, 'EEEE', { locale: nb })} {format(day.date, 'd. MMMM', { locale: nb })}
                          {isSameDay(day.date, new Date()) && 
                           <span className="ml-1 text-green-600">(i dag)</span>}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <div className="flex items-center">
                        <Thermometer className="h-5 w-5 text-blue-500 mr-1" />
                        <span>{day.minTemp.toFixed(0)}°</span>
                        <span className="mx-1">-</span>
                        <ThermometerSun className="h-5 w-5 text-red-500 mr-1" />
                        <span>{day.maxTemp.toFixed(0)}°</span>
                      </div>
                      <div className="flex items-center">
                        <Wind className="h-5 w-5 text-gray-500 mr-1" />
                        <span>{day.maxWind.toFixed(1)} m/s</span>
                      </div>
                      <div className="flex items-center">
                        <CloudRain className="h-5 w-5 text-blue-500 mr-1" />
                        <span>{day.totalPrecipitation.toFixed(1)} mm nedbør</span>
                      </div>
                      <div>{getWeatherRiskBadge(day.riskLevel, "large")}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-xs text-gray-500 mt-1">
              Data: Meteorologisk institutt (MET). Vurder værets påvirkning på arbeidssikkerhet.
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-sm">Ingen værdata tilgjengelig for denne lokasjonen.</div>
            <Button onClick={handleRefresh} size="sm" variant="outline" className="flex items-center gap-1">
              <RefreshCcw className="h-4 w-4" />
              Last inn på nytt
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 