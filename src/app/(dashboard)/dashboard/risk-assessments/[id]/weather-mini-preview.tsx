'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { CloudRain, Snowflake, Sun, Wind, AlertTriangle, RefreshCcw, ThermometerSun, Thermometer, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { format, isSameDay, parseISO } from 'date-fns'
import { nb } from 'date-fns/locale'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface WeatherMiniPreviewProps {
  latitude: number
  longitude: number
  id: string
  locationName?: string | null
}

interface WeatherData {
  temperature: number
  windSpeed: number
  precipitation: number
  symbolCode: string
  riskLevel: 'low' | 'medium' | 'high'
}

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

export function WeatherMiniPreview({ latitude, longitude, id, locationName }: WeatherMiniPreviewProps) {
  // Logg informasjon om locationName for debugging
  console.log(`[WeatherMini] Received locationName: "${locationName}", type: ${typeof locationName}`);
  
  // Sikre at vi alltid har en meningsfylt stedsnavn-verdi
  const displayName = locationName || "Valgt lokasjon";
  
  // Sikre at koordinater er tall
  const latNumber = typeof latitude === 'number' ? latitude : parseFloat(String(latitude));
  const lonNumber = typeof longitude === 'number' ? longitude : parseFloat(String(longitude));
  
  // Valider koordinater
  const validCoordinates = !isNaN(latNumber) && !isNaN(lonNumber) && 
                           latNumber >= -90 && latNumber <= 90 && 
                           lonNumber >= -180 && lonNumber <= 180;
  
  // Logg koordinatinfo for debugging
  console.log(`[WeatherMini] Koordinater - latitude: ${latitude} (${typeof latitude}), longitude: ${longitude} (${typeof longitude})`);
  console.log(`[WeatherMini] Validerte koordinater: ${validCoordinates}, latNumber: ${latNumber}, lonNumber: ${lonNumber}`);
  
  // Funksjon for å hente værdata - nå med bedre typesikkerhet
  const fetchWeatherData = async () => {
    // Sikre at vi har gyldige tall for koordinatene
    if (!validCoordinates) {
      console.error('[WeatherMiniPreview] Ugyldige koordinater:', { latNumber, lonNumber });
      throw new Error('Ugyldige koordinater');
    }
    
    // Formater koordinater med maks 4 desimaler for API-kallet
    const formattedLat = latNumber.toFixed(4);
    const formattedLon = lonNumber.toFixed(4);
    
    console.log(`[WeatherMiniPreview] Henter værdata for ${formattedLat}, ${formattedLon}`);
    
    // Legg til timestamp for å unngå caching
    const timestamp = Date.now();
    const url = `/api/weather?lat=${formattedLat}&lon=${formattedLon}&t=${timestamp}`;
    
    // Debugging - logg fullstendig URL
    console.log(`[WeatherMiniPreview] API URL: ${url}`);
    
    // Bruk samme fetch-konfigurasjon som i weather-forecast.tsx
    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.error(`[WeatherMiniPreview] Feil ved API-kall: ${response.status} ${response.statusText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('[WeatherMiniPreview] Værdata mottatt:', data);
    
    // Sjekk at dataene inneholder den forventede strukturen
    if (!data.properties || !data.properties.timeseries || !Array.isArray(data.properties.timeseries)) {
      console.error('[WeatherMiniPreview] Manglende eller ugyldig forecast-data:', data);
      throw new Error('Ugyldig respons-format fra API');
    }
    
    return data;
  };
  
  // Bruk React Query med tidsbasert nøkkel for å unngå caching
  const queryKey = ['weather-mini', latNumber, lonNumber, id, Math.floor(Date.now() / (5 * 60 * 1000))];
  
  const { 
    data,
    isLoading,
    isError,
    refetch,
    isFetching
  } = useQuery({
    queryKey,
    queryFn: fetchWeatherData,
    staleTime: 5 * 60 * 1000, // 5 minutter
    gcTime: 10 * 60 * 1000, // 10 minutter
    enabled: validCoordinates,
    retry: 2,
    refetchOnWindowFocus: false,
  });
  
  // Funksjon for å gruppere værdata etter dag
  const groupForecastsByDay = (timeseries: any[]): DailyForecast[] => {
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
  };
  
  // Behandle data til daglige prognoser
  const dailyForecasts = data && data.properties && data.properties.timeseries ? 
    groupForecastsByDay(data.properties.timeseries.slice(0, 72)).slice(0, 3) : 
    [];
  
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
  
  // Håndter manuell oppdatering av værdata
  const handleRefresh = () => {
    console.log('[WeatherMini] Manuell oppdatering av værdata');
    refetch();
  };
  
  // Avbryt tidlig om vi mangler gyldig lokasjon
  useEffect(() => {
    if (!validCoordinates) {
      console.error('[WeatherMiniPreview] Ugyldige koordinater:', { latNumber, lonNumber });
      return;
    }
    
    // Logg gyldige koordinater for debugging
    console.log('[WeatherMiniPreview] Laster værinformasjon for:', { 
      latNumber, 
      lonNumber, 
      locationName,
      latType: typeof latNumber,
      lonType: typeof lonNumber
    });
  }, [latNumber, lonNumber, validCoordinates, locationName]);
  
  // Vis feilmelding hvis vi ikke kunne laste værdata
  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-3">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <p className="text-red-700 text-sm">
            Kunne ikke laste værdata. Sjekk at lokasjonen er korrekt.
          </p>
        </div>
        <p className="text-red-500 text-xs mt-2">
          Detaljer: Breddegrader skal være mellom -90 og 90, lengdegrader mellom -180 og 180.
          Gjeldende verdier: {latitude}, {longitude}
        </p>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    )
  }
  
  if (isFetching || !dailyForecasts.length) {
    return (
      <div className="space-y-2">
        <div className="text-sm text-red-500">{isFetching ? 'Laster værdata...' : 'Ingen værdata tilgjengelig'}</div>
        <Button variant="outline" size="sm" onClick={handleRefresh} className="mt-2 flex items-center gap-1">
          <RefreshCcw className="h-3 w-3" />
          <span>Prøv igjen</span>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="text-sm font-medium">
          Værvarsel - 3 dager
          <span className="ml-1 text-gray-500">({displayName})</span>
        </div>
        <Button variant="ghost" size="icon" onClick={handleRefresh} title="Oppdater værdata">
          <RefreshCcw className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Kompakt visning av 3 dagers værmelding */}
      <div className="grid grid-cols-3 gap-2">
        {dailyForecasts.map((day: DailyForecast, index: number) => (
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
      
      <div className="text-xs text-gray-500">
        <div className="flex justify-between items-center">
          <div>Meteorologisk institutt (MET)</div>
          <div className="flex items-center gap-1">
            <Wind className="h-3 w-3" />
            <span>Vind er en viktig risikofaktor</span>
          </div>
        </div>
      </div>
    </div>
  )
} 