'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { CloudRain, Snowflake, Sun, Wind, AlertTriangle, RefreshCcw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { format, isSameDay, parseISO } from 'date-fns'
import { nb } from 'date-fns/locale'

interface WeatherMiniPreviewProps {
  latitude: number
  longitude: number
  id: string
  locationName?: string | null
  weatherData?: any // Legg til weather snapshot data
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
    
    console.log(`[SJA-Weather] Henter værdata for koordinater: ${formattedLat},${formattedLon}`);
    
    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      next: { revalidate: 0 }
    });
    
    if (!response.ok) {
      throw new Error(`Værdata-feil: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`[SJA-Weather] Mottok værdata med tidsstempel: ${data._metadata?.timestamp || 'ukjent'}`);
    return data;
  } catch (error) {
    console.error('[SJA-Weather] Feil ved henting av værdata:', error);
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

export function WeatherMiniPreview({ latitude, longitude, id, locationName, weatherData }: WeatherMiniPreviewProps) {
  // Sikre at vi alltid har en meningsfylt stedsnavn-verdi
  const displayName = locationName || "SJA arbeidssted";
  
  // Hvis vi har lagret værdata, bruker vi det
  const [useStoredData, setUseStoredData] = useState<boolean>(!!weatherData?.forecasts);
  
  // Bruk lagret værdata hvis tilgjengelig, ellers hent nye data
  const { 
    data: liveWeatherData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['weather', latitude, longitude, id],
    queryFn: () => fetchWeatherData(id, latitude, longitude),
    enabled: !useStoredData && !!latitude && !!longitude,
    staleTime: 1000 * 60 * 30, // 30 minutter
    refetchOnWindowFocus: false
  });
  
  // Bruk enten lagret data eller live data
  const weatherToUse = useStoredData ? weatherData : liveWeatherData;
  
  // Behandle data til daglige prognoser
  const dailyForecasts = weatherToUse && weatherToUse.properties?.timeseries ? 
    groupForecastsByDay(weatherToUse.properties.timeseries.slice(0, 72)).slice(0, 3) 
    : weatherToUse?.forecasts || [];

  // Vis om vi bruker lagret eller live data
  const dataSource = useStoredData ? 
    `Værdata fra ${new Date(weatherData.timestamp).toLocaleDateString('nb-NO')}` : 
    'Sanntids værdata';
  
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
  
  // Vis spinner under lasting
  if (isLoading && !useStoredData && !dailyForecasts.length) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500">Værvarsel for {displayName}</div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  // Vis feilmelding ved feil
  if (error && !useStoredData && !dailyForecasts.length) {
    return (
      <div className="p-4 border rounded-md bg-red-50 text-red-800">
        <p className="text-sm font-medium">Kunne ikke hente værdata</p>
        <p className="text-xs">Vennligst prøv igjen senere</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-500">Værvarsel for {displayName}</div>
        <div className="text-xs text-gray-500">{dataSource}</div>
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4">
            {dailyForecasts.map((forecast: DailyForecast, index: number) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-2">
                  {getWeatherIcon(forecast.symbolCode)}
                </div>
                <div className="text-sm font-medium">{forecast.day}</div>
                <div className="text-xs text-gray-500">
                  {forecast.maxTemp}° / {forecast.minTemp}°
                </div>
                <div className="mt-2">
                  {getRiskBadge(forecast.riskLevel)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 