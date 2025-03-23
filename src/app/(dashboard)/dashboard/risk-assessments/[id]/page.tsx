import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { notFound } from "next/navigation"
import { RiskAssessmentClient } from "./risk-assessment-client"
import { Suspense } from "react"
import { HMSChangesSection } from "./hms-changes-section"
import type { Hazard, RiskAssessment } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { RiskMatrix } from "./risk-matrix"

// Metadata konfigurering for å hindre caching
export const dynamic = 'force-dynamic'; // Forhindre statisk generering
export const revalidate = 0; // Revalider ved hver forespørsel

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

// Type for RiskAssessmentClient
type RiskAssessmentWithHazards = Omit<RiskAssessment, 'location'> & {
  hazards: Array<Hazard & {
    measures: Array<{
      id: string
      description: string
      type: string
      status: string
      priority: string
      dueDate: Date | null
      completedAt: Date | null
      assignedTo: string | null
    }>
    riskMeasures: Array<{
      id: string
      description: string
      status: string
      type: string
      priority: string
      hazardId: string
    }>
    hmsChanges: Array<{
      hmsChange: {
        id: string
        title: string
        description: string
        status: string
        implementedAt: Date | null
      }
    }>
    metadata?: any
  }>
  location?: {
    latitude: number | null
    longitude: number | null
    name?: string | null
  } | null
}

// Type for HMSChangesSection
type RiskAssessmentWithHMSChanges = RiskAssessment & {
  hazards?: Array<{
    id: string
    description: string
    riskLevel: number
    riskMeasures: Array<{
      id: string
      description: string
      status: string
      type: string
      priority: string
      hazardId: string
      riskAssessmentId: string
      hmsChanges: Array<{
        hmsChange: {
          id: string
          title: string
          description: string
          status: string
          implementedAt: Date | null
        }
      }>
    }>
  }>
  hmsChanges?: Array<{
    hmsChange: {
      id: string
      title: string
      description: string
      status: string
      implementedAt: Date | null
    }
  }>
}

// Hjelpefunksjon for å konvertere Prisma-objekter til rene JavaScript-objekter
function toPlainObject(obj: any): any {
  // Hvis objektet er null eller undefined, returner det som det er
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  // Hvis objektet ikke er et objekt (primitive verdier), returner det som det er
  if (typeof obj !== 'object') {
    return obj;
  }
  
  // Hvis objektet er en Date, konverter til ISO-streng
  if (obj instanceof Date) {
    return obj.toISOString();
  }
  
  // Hvis objektet er et array, konverter hvert element
  if (Array.isArray(obj)) {
    return obj.map(item => toPlainObject(item));
  }
  
  // Sjekk om objektet har et toJSON-metode (f.eks. Decimal fra Prisma)
  if (typeof obj.toJSON === 'function') {
    return obj.toJSON();
  }
  
  // For BigInt, konverter til string
  if (typeof obj === 'bigint') {
    return obj.toString();
  }
  
  // For vanlige objekter, konverter hver egenskap - bruk vanlig objekt istedenfor Object.create(null)
  // Object.create(null) skaper objekter uten prototype som Next.js ikke kan serialisere
  const plainObj: Record<string, any> = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      try {
        plainObj[key] = toPlainObject(obj[key]);
      } catch (error) {
        console.error(`Kunne ikke konvertere felt '${key}':`, error);
        plainObj[key] = null; // Bruk null som fallback
      }
    }
  }
  
  // Ekstra validering for location-objektet
  if ('location' in plainObj && plainObj.location !== null && typeof plainObj.location === 'object') {
    plainObj.location = {
      latitude: plainObj.location.latitude !== null && plainObj.location.latitude !== undefined
        ? Number(plainObj.location.latitude)
        : null,
      longitude: plainObj.location.longitude !== null && plainObj.location.longitude !== undefined
        ? Number(plainObj.location.longitude)
        : null,
      name: plainObj.location.name || null
    };
  }
  
  return plainObj;
}

// En hjelpefunksjon for å sikre at objektet er 100% serialiserbart for React Server Components
function ensureSerializable<T>(obj: T): T {
  // Bruk JSON.parse(JSON.stringify()) for å sikre full serialiserbarhet
  // Dette vil fjerne alle funksjoner, symboler, og andre ikke-serialiserbare verdier
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    console.error('Feil ved serialisering av objekt:', error);
    throw new Error('Objektet kunne ikke serialiseres');
  }
}

export default async function RiskAssessmentPage(props: PageProps) {
  // Wrapper alt i en try-catch for å fange alle mulige feil
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return notFound()

    // Await både params og searchParams
    const { id } = await props.params
    const searchParamsResolved = await props.searchParams
    const db = await prisma
    
    // Legg til en timestamp for å forhindre caching
    const timestamp = Date.now();
    console.log(`Laster risikovurdering (${id}) med timestamp: ${timestamp}`);

    // Henter risikovurderingen med inkluderte relasjoner
    const assessment = await db.riskAssessment.findFirst({
      where: {
        id,
        company: {
          users: {
            some: {
              id: session.user.id
            }
          }
        }
      },
      include: {
        equipment: true,
        hazards: {
          include: {
            riskMeasures: true,
            hmsChanges: {
              include: {
                hmsChange: true
              }
            }
          },
          orderBy: {
            riskLevel: 'desc'
          }
        },
        hmsChanges: {
          include: {
            hmsChange: true
          }
        }
      }
    })

    if (!assessment) {
      return notFound()
    }

    // Legg til debug-utskrift for å vise type av location for debugging
    console.log('Location type:', typeof assessment.location);
    if (assessment.location) {
      console.log('Location value (first 100 chars):', 
                typeof assessment.location === 'string' 
                ? assessment.location.substring(0, 100) 
                : JSON.stringify(assessment.location).substring(0, 100));
    }

    // Sikre at location alltid er riktig formatert som et objekt
    let locationObject = null;
    if (assessment.location) {
      try {
        if (typeof assessment.location === 'string') {
          locationObject = JSON.parse(assessment.location);
          console.log('Parsed location from string:', locationObject);
        } else {
          // Hvis det allerede er et objekt, bruk det direkte
          locationObject = assessment.location;
          console.log('Location is already an object:', locationObject);
        }
        
        // Validér at objektet har riktige felt og konverter verdier til riktig type
        locationObject = {
          latitude: locationObject.latitude !== null && locationObject.latitude !== undefined
            ? Number(locationObject.latitude)
            : null,
          longitude: locationObject.longitude !== null && locationObject.longitude !== undefined
            ? Number(locationObject.longitude)
            : null,
          name: locationObject.name || null
        };
        
        // Sjekk at koordinatene er gyldige tall
        if (locationObject.latitude !== null && isNaN(locationObject.latitude)) {
          console.error('Ugyldig latitude-verdi:', locationObject.latitude);
          locationObject.latitude = null;
        }
        
        if (locationObject.longitude !== null && isNaN(locationObject.longitude)) {
          console.error('Ugyldig longitude-verdi:', locationObject.longitude);
          locationObject.longitude = null;
        }
        
        console.log('Validert location-objekt:', locationObject);
      } catch (error) {
        console.error('Feil ved parsing av location:', error);
        locationObject = null;
      }
    } else {
      console.log('Ingen location funnet på assessment');
    }
    
    // Sett validert location
    assessment.location = locationObject;
    
    // Konvertere objektet til et rent JavaScript-objekt og sikre at det er serialiserbart
    const safeAssessment = toPlainObject(assessment);
    
    console.log('Endelig location som sendes til klienten:', 
      safeAssessment.location ? JSON.stringify(safeAssessment.location) : 'null');

    // Implementer revalidation for serversidekomponenten
    const revalidateAssessment = async () => {
      'use server'
      try {
        // Bruk både revalidatePath og revalidateTag for å sikre oppdatering
        revalidatePath(`/dashboard/risk-assessments/${id}`)
      } catch (error) {
        console.error('Feil ved revalidering:', error)
      }
    }

    // Forenklet struktur for HMS-endringer
    const hmsAssessmentData = {
      id: assessment.id,
      title: assessment.title,
      description: assessment.description,
      status: assessment.status,
      hazards: assessment.hazards.map(hazard => ({
        id: hazard.id,
        description: hazard.description,
        riskLevel: Number(hazard.riskLevel),
        riskMeasures: hazard.riskMeasures?.map(measure => ({
          id: measure.id,
          description: measure.description,
          status: measure.status,
          type: measure.type,
          priority: measure.priority,
          hazardId: measure.hazardId,
          riskAssessmentId: assessment.id,
          hmsChanges: hazard.hmsChanges?.map(h => ({
            hmsChange: {
              id: h.hmsChange.id,
              title: h.hmsChange.title,
              description: h.hmsChange.description,
              status: h.hmsChange.status,
              implementedAt: h.hmsChange.implementedAt?.toISOString() || null
            }
          })) || []
        })) || []
      })),
      hmsChanges: assessment.hmsChanges?.map(h => ({
        hmsChange: {
          id: h.hmsChange.id,
          title: h.hmsChange.title,
          description: h.hmsChange.description,
          status: h.hmsChange.status,
          implementedAt: h.hmsChange.implementedAt?.toISOString() || null
        }
      })) || []
    };

    // Konverter direkte til JSON og tilbake for å garantere serialiserbarhet
    const clientAssessment = JSON.parse(JSON.stringify(safeAssessment)) as RiskAssessmentWithHazards;
    const hmsAssessment = JSON.parse(JSON.stringify(hmsAssessmentData)) as RiskAssessmentWithHMSChanges;

    return (
      <div className="space-y-6">
        <Suspense fallback={<div>Laster...</div>}>
          <RiskAssessmentClient 
            assessment={clientAssessment}
            onUpdate={revalidateAssessment} 
          />
        </Suspense>
        
        <Suspense fallback={<div>Laster HMS-endringer...</div>}>
          <HMSChangesSection riskAssessment={hmsAssessment} />
        </Suspense>
      </div>
    )
  } catch (error) {
    console.error("Error fetching risk assessment:", error)
    return notFound()
  }
}

// Metadata må også awaite params
export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  
  return {
    title: `Risikovurdering ${id}`,
    description: 'Detaljert visning av risikovurdering'
  }
} 