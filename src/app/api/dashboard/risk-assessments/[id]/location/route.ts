import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { z } from "zod"

// Skjema for validering av lokasjonsinformasjon - nå med støtte for stedsnavn
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
    
    // Sjekk at risikovurderingen eksisterer og tilhører brukerens bedrift
    const assessment = await prisma.riskAssessment.findFirst({
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
    
    if (!assessment) {
      return NextResponse.json({ error: "Risikovurdering ikke funnet" }, { 
        status: 404,
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate'
        }
      })
    }
    
    // Valider innsendt lokasjonsinformasjon
    const data = await req.json()
    console.log('Mottatt lokasjonsdata:', data)
    
    try {
      // Konvertere til Number for å sikre riktig format og inkluder stedsnavn
      const normalizedData = {
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
        name: data.name || "Valgt lokasjon" // Bruk alltid et standardnavn hvis det mangler
      };
      
      const validatedData = locationSchema.parse(normalizedData);
      console.log('Validert lokasjonsdata:', validatedData);
      console.log('Stedsnavn som lagres:', validatedData.name);
      
      // Konverter til JSON-streng med punktum som desimalskilletegn og inkluder stedsnavn
      const locationJson = JSON.stringify({
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        name: validatedData.name
      });
      
      console.log('Lagrer lokasjonsdata som JSON:', locationJson);
      
      // Oppdater risikovurderingen med lokasjonsinformasjon
      const updatedAssessment = await prisma.riskAssessment.update({
        where: { id },
        data: {
          location: locationJson,
          updatedBy: session.user.id,
          updatedAt: new Date()
        }
      })
      
      return NextResponse.json({ 
        success: true, 
        message: "Lokasjon oppdatert",
        timestamp: Date.now() // Legg til timestamp for å hindre caching
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
    console.error("Feil ved oppdatering av risikovurderingslokasjon:", error)
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