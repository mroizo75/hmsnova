'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { CloudRain, Snowflake, Sun, Wind, AlertTriangle, RefreshCcw, ThermometerSun, Thermometer } from 'lucide-react'
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

// Funksjon for å hente værdata med anti-cache tiltak
async function fetchWeatherData(id: string, latitude: number, longitude: number) {
  try {
    // Sikre at vi har gyldige tall for koordinatene
    if (isNaN(latitude) || isNaN(longitude)) {
      throw new Error('Ugyldige koordinater: latitude eller longitude er ikke et tall');
    }
    
    // Formater koordinater for å sikre gyldige verdier
    const formattedLat = parseFloat(latitude.toString()).toFixed(4);
    const formattedLon = parseFloat(longitude.toString()).toFixed(4);
    
    // Bygg en enkel URL uten for mange parametre
    const url = `/api/weather?lat=${formattedLat}&lon=${formattedLon}`;
    
    console.log(`[WeatherMini] Henter værdata for koordinater: ${formattedLat},${formattedLon}`);
    
    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      next: { revalidate: 0 }
    });
    
    if (!response.ok) {
      throw new Error(`Værdata-feil: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`[WeatherMini] Mottok værdata med tidsstempel: ${data._metadata?.timestamp || 'ukjent'}`);
    return data;
  } catch (error) {
    console.error('[WeatherMini] Feil ved henting av værdata:', error);
    throw error;
  }
}

// Funksjon for å gruppere værdata etter dag
function groupForecastsByDay(timeseries: any[]): DailyForecast[] {
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
  
  // Bruk React Query med tidsbasert nøkkel for å unngå caching
  const queryKey = ['weather-mini', latNumber, lonNumber, id, Math.floor(Date.now() / (5 * 60 * 1000))];
  
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey,
    queryFn: () => fetchWeatherData(id, latNumber, lonNumber),
    staleTime: 5 * 60 * 1000, // 5 minutter
    gcTime: 10 * 60 * 1000, // 10 minutter
    enabled: !!id && validCoordinates,
    retry: 2,
  });
  
  // Behandle data til daglige prognoser
  const dailyForecasts = data ? groupForecastsByDay(data.properties.timeseries.slice(0, 72)).slice(0, 3) : [];
  
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
  
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    )
  }
  
  if (error || !dailyForecasts.length) {
    return (
      <div className="space-y-2">
        <div className="text-sm text-red-500">{error instanceof Error ? error.message : 'Ingen værdata tilgjengelig'}</div>
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