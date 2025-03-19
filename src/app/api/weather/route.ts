import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"

// Bruk standard Next.js caching-direktiver
export const dynamic = 'force-dynamic' // Force dynamisk generering hver gang

/**
 * API-rute for å hente værdata fra MET API
 * Bruker server-side proxying for å unngå CORS problemer
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse(JSON.stringify({ error: "Ikke autorisert" }), { 
        status: 401,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }

    // Hent lat/lon fra URL-parametere
    const { searchParams } = new URL(req.url)
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')

    // Logg for debugging
    console.log(`[Weather API] Forespørsel mottatt for lat=${lat}, lon=${lon}, timestamp=${Date.now()}`);

    if (!lat || !lon) {
      return new NextResponse(JSON.stringify({ error: "Mangler koordinater" }), { 
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }

    // Hent data direkte fra MET API
    const metUrl = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`;
    console.log(`[Weather API] Henter værdata fra: ${metUrl}`);
    
    // Viktig: MET API krever en User-Agent header
    const response = await fetch(metUrl, {
      headers: {
        'User-Agent': 'Innutio-HMS/1.0 kenneth@innutio.no',
      },
      cache: 'no-store' // Ikke cache på server-siden
    });

    if (!response.ok) {
      throw new Error(`MET API svarte med status: ${response.status}`)
    }

    const weatherData = await response.json();
    
    // Prosesser værdataene
    const processedData = {
      properties: weatherData.properties,
      forecasts: weatherData.properties.timeseries.map((item: any) => {
        const date = new Date(item.time);
        return {
          date: date.toISOString(),
          day: date.toLocaleDateString('nb-NO', { weekday: 'long' }),
          symbolCode: item.data.next_1_hours?.summary?.symbol_code || 'clearsky_day',
          minTemp: item.data.instant.details.air_temperature,
          maxTemp: item.data.instant.details.air_temperature,
          maxWind: item.data.instant.details.wind_speed,
          totalPrecipitation: item.data.next_1_hours?.details.precipitation_amount || 0,
          riskLevel: calculateRiskLevel(
            item.data.instant.details.air_temperature,
            item.data.instant.details.wind_speed,
            item.data.next_1_hours?.details.precipitation_amount || 0
          )
        };
      }).slice(0, 24) // Ta med 24 timers prognose
    };

    // Returner data med metadata
    return NextResponse.json({
      ...processedData,
      _metadata: {
        timestamp: Date.now(),
        source: 'MET API'
      }
    });
  } catch (error: any) {
    console.error('Feil ved henting av værdata:', error)
    return new NextResponse(JSON.stringify({ 
      error: "Kunne ikke hente værdata", 
      details: error?.message || 'Ukjent feil'
    }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}

// Hjelpefunksjon for å beregne risikonivå
function calculateRiskLevel(temp: number, wind: number, precip: number): string {
  let riskLevel = 'Lav';
  
  if (wind > 15 || precip > 5 || temp < -10 || temp > 30) {
    riskLevel = 'Høy';
  } else if (wind > 8 || precip > 1 || temp < 0 || temp > 25) {
    riskLevel = 'Middels';
  }
  
  return riskLevel;
} 