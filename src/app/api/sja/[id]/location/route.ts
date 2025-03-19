import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { z } from "zod"

// Skjema for validering av lokasjonsinformasjon
const locationSchema = z.object({
  latitude: z.number().refine(val => val >= -90 && val <= 90, "Breddegrad må være mellom -90 og 90"),
  longitude: z.number().refine(val => val >= -180 && val <= 180, "Lengdegrad må være mellom -180 og 180"),
  name: z.string().nullable().optional()
})

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Ikke autorisert" }, { 
        status: 401,
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate'
        }
      })
    }

    const { id } = params
    
    // Sjekk at SJA-en eksisterer og tilhører brukerens bedrift
    const sja = await prisma.sJA.findFirst({
      where: {
        id,
        company: {
          users: {
            some: {
              id: session.user.id
            }
          }
        }
      }
    })
    
    if (!sja) {
      return NextResponse.json({ error: "SJA ikke funnet" }, { 
        status: 404,
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate'
        }
      })
    }
    
    // Valider innsendt lokasjonsinformasjon
    const data = await req.json()
    console.log('Mottatt lokasjonsdata:', JSON.stringify(data, null, 2))
    
    try {
      // Konvertere til Number for å sikre riktig format og inkluder stedsnavn
      const normalizedData = {
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
        name: data.name || sja.arbeidssted || "Valgt lokasjon" // Bruk arbeidssted som default hvis det mangler
      };
      
      const validatedData = locationSchema.parse(normalizedData);
      console.log('Validert lokasjonsdata:', validatedData);
      
      // Sjekk at værdata er tilgjengelig
      if (!data.weatherData) {
        console.warn('Ingen værdata mottatt i request');
      } else {
        console.log('Værdata mottatt:', JSON.stringify(data.weatherData, null, 2));
      }
      
      // Konverter til JSON-streng med punktum som desimalskilletegn og inkluder stedsnavn
      const locationJson = JSON.stringify({
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        name: validatedData.name,
        weatherData: data.weatherData || null // Inkluder værdata hvis tilgjengelig
      });
      
      console.log('Lagrer lokasjonsdata som JSON:', locationJson);
      
      // Oppdater SJA-en med lokasjonsinformasjon
      const updatedSJA = await prisma.sJA.update({
        where: { id },
        data: {
          location: locationJson,
          oppdatertDato: new Date()
        }
      })

      // Verifiser at dataene ble lagret riktig
      const savedLocation = JSON.parse(updatedSJA.location || '{}');
      console.log('Verifisert lagret data:', JSON.stringify(savedLocation, null, 2));
      
      // Sjekk at værdataene ble lagret riktig
      if (savedLocation.weatherData) {
        console.log('Værdata lagret:', JSON.stringify(savedLocation.weatherData, null, 2));
      } else {
        console.warn('Ingen værdata ble lagret i lokasjonsdataene');
      }
      
      return NextResponse.json({ 
        success: true, 
        message: "Lokasjon oppdatert",
        timestamp: Date.now(), // Legg til timestamp for å hindre caching
        location: savedLocation // Inkluder lagret data i responsen
      }, {
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate'
        }
      })
      
    } catch (validationError) {
      console.error('Valideringsfeil:', validationError)
      if (validationError instanceof z.ZodError) {
        return NextResponse.json({ 
          error: "Valideringsfeil", 
          details: validationError.format(),
          message: "Ugyldig lokasjonsdata. Kontroller at breddegrad og lengdegrad er gyldige tall."
        }, { 
          status: 400,
          headers: {
            'Cache-Control': 'no-store, max-age=0, must-revalidate'
          }
        })
      }
      throw validationError
    }
    
  } catch (error) {
    console.error("Feil ved oppdatering av SJA-lokasjon:", error)
    return NextResponse.json({ 
      error: "Serverfeil", 
      message: "Kunne ikke oppdatere lokasjon. Prøv igjen senere."
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate'
      }
    })
  }
} 