import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { createNotification } from "@/lib/notifications/notification-service"
import { revalidatePath } from 'next/cache'
import { withTimeout } from '@/lib/utils/api-timeout'
import { logger } from '@/lib/utils/logger'
import { cacheData, invalidateCache, TTL } from '@/lib/cache/multi-level-cache'
import { CacheGroup } from '@/lib/cache/redis-cache'

// Definerer returtypen for getSJAData
type SJADataResult = [number, any[]]

// Hjelpefunksjon for å hente SJA-data med paginering og filtrering
async function getSJAData(
  companyId: string,
  page: number = 1,
  limit: number = 10,
  search: string = '',
  status: string = ''
): Promise<SJADataResult> {
  const skip = (page - 1) * limit
  
  // Bygg spørringsbetingelser
  const where: any = { companyId }
  
  if (search) {
    where.OR = [
      { tittel: { contains: search, mode: 'insensitive' } },
      { arbeidssted: { contains: search, mode: 'insensitive' } },
      { beskrivelse: { contains: search, mode: 'insensitive' } }
    ]
  }
  
  if (status) {
    where.status = status
  }
  
  // Fetch data with pagination
  return await prisma.$transaction([
    prisma.sJA.count({ where }),
    prisma.sJA.findMany({
      where,
      skip,
      take: limit,
      orderBy: { opprettetDato: 'desc' },
      include: {
        opprettetAv: {
          select: { id: true, name: true, email: true }
        },
        tiltak: true,
        risikoer: true
      }
    })
  ])
}

// GET - Hent SJA-data med caching
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Uautorisert' }, { status: 401 })
  }
  
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''
  
  const companyId = session.user.companyId
  if (!companyId) {
    return NextResponse.json({ error: 'Bedrifts-ID mangler' }, { status: 400 })
  }
  
  try {
    // Bruk flernivå caching for SJA-data
    const data = await cacheData(
      CacheGroup.SJA,
      async () => {
        const fetchResult = await withTimeout<SJADataResult>(
          getSJAData(companyId, page, limit, search, status),
          10000,
          'Tidsavbrudd ved henting av SJA-data'
        )
        
        return {
          items: fetchResult[1],
          total: fetchResult[0],
          page,
          limit,
          totalPages: Math.ceil(fetchResult[0] / limit)
        }
      },
      {
        params: { page, limit, search, status },
        ttl: TTL.MEDIUM, // 10 minutter
        useMemoryCache: true,
        useNextCache: true,
        useRedisCache: true
      }
    )
    
    return NextResponse.json(data)
  } catch (error: any) {
    logger.error('Feil ved henting av SJA-data', { 
      error: error as Error,
      data: { companyId, page, limit }
    })
    
    const isTimeout = error.message.includes('Tidsavbrudd')
    return NextResponse.json(
      { error: isTimeout ? 'Forespørselen tok for lang tid' : 'Feil ved henting av data' },
      { status: isTimeout ? 504 : 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const json = await request.json()
    console.log('Innkommende data:', json)
    console.log('Latitude:', json.latitude, 'Longitude:', json.longitude, 'LocationName:', json.locationName)
    
    // Test om verdiene konverteres riktig
    const locationJson = json.latitude && json.longitude ? 
      JSON.stringify({
        latitude: Number(json.latitude),
        longitude: Number(json.longitude),
        name: json.locationName || json.arbeidssted || "Valgt lokasjon",
        weatherData: json.weatherData || null // Lagrer værdata-snapshot
      }) : 
      null;
    console.log('Location JSON:', locationJson)

    const sja = await prisma.sJA.create({
      data: {
        tittel: json.tittel,
        arbeidssted: json.arbeidssted,
        beskrivelse: json.beskrivelse,
        startDato: new Date(json.startDato),
        sluttDato: json.sluttDato ? new Date(json.sluttDato) : null,
        status: json.status || "UTKAST",
        deltakere: json.deltakere,
        companyId: session.user.companyId,
        opprettetAvId: session.user.id,
        location: locationJson,
        bilder: json.bilder?.create ? json.bilder : {
          create: json.bilder?.map((url: string) => ({
            url: url
          })) || []
        },
        produkter: json.produkter,
        risikoer: json.risikoer?.create ? {
          create: json.risikoer.create.map((r: any) => ({
            aktivitet: r.aktivitet,
            fare: r.fare,
            konsekvens: r.konsekvens || '',
            sannsynlighet: r.sannsynlighet,
            alvorlighet: r.alvorlighet,
            risikoVerdi: r.risikoVerdi
          }))
        } : {
          create: json.risikoer?.map((r: any) => ({
            aktivitet: r.aktivitet,
            fare: r.fare,
            konsekvens: r.konsekvens || '',
            sannsynlighet: r.sannsynlighet,
            alvorlighet: r.alvorlighet,
            risikoVerdi: r.risikoVerdi
          })) || []
        },
        tiltak: json.tiltak?.create ? {
          create: json.tiltak.create.map((t: any) => ({
            beskrivelse: t.beskrivelse,
            ansvarlig: t.ansvarlig,
            status: t.status || "PLANLAGT",
            frist: t.frist ? new Date(t.frist) : null
          }))
        } : {
          create: json.tiltak?.map((t: any) => ({
            beskrivelse: t.beskrivelse,
            ansvarlig: t.ansvarlig,
            status: t.status || "PLANLAGT",
            frist: t.frist ? new Date(t.frist) : null
          })) || []
        }
      },
      include: {
        risikoer: true,
        tiltak: true,
        produkter: true,
        bilder: true,
        opprettetAv: {
          select: {
            name: true,
            email: true,
            role: true
          }
        }
      }
    })

    // Send notifikasjoner
    const companyAdmins = await prisma.user.findMany({
      where: {
        companyId: session.user.companyId,
        role: 'COMPANY_ADMIN'
      }
    })

    // Opprett notifikasjoner for alle bedriftsadministratorer
    await Promise.all(companyAdmins.map(admin => 
      createNotification({
        userId: admin.id,
        type: 'SJA_CREATED',
        title: 'Ny SJA registrert',
        message: `${session.user.name} har opprettet en ny SJA: ${sja.tittel}`,
        link: `/dashboard/sja/${sja.id}`
      })
    ))

    // Invalider cache etter oppretting av ny SJA
    await invalidateCache(CacheGroup.SJA)
    
    // Revalider SJA-relaterte paths for Next.js
    revalidatePath('/dashboard/sja')
    revalidatePath('/api/sja')
    
    return NextResponse.json(sja)
  } catch (error) {
    logger.error('Feil ved oppretting av SJA', { error: error as Error })
    return NextResponse.json(
      { error: 'Kunne ikke opprette SJA' },
      { status: 500 }
    )
  }
}

// PUT - Oppdater SJA med cache-invalidering
export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Uautorisert' }, { status: 401 })
  }
  
  try {
    const data = await request.json()
    
    // Valider data...
    if (!data.id) {
      return NextResponse.json({ error: 'SJA-ID mangler' }, { status: 400 })
    }
    
    const companyId = session.user.companyId
    if (!companyId) {
      return NextResponse.json({ error: 'Bedrifts-ID mangler' }, { status: 400 })
    }
    
    // Sjekk om SJA eksisterer og tilhører bedriften
    const existingSja = await prisma.sJA.findFirst({
      where: { id: data.id, companyId }
    })
    
    if (!existingSja) {
      return NextResponse.json({ error: 'SJA ikke funnet' }, { status: 404 })
    }
    
    // Forbered oppdateringsdata
    const updateData = {
      tittel: data.tittel,
      arbeidssted: data.arbeidssted,
      beskrivelse: data.beskrivelse,
      startDato: new Date(data.startDato),
      sluttDato: data.sluttDato ? new Date(data.sluttDato) : null,
      status: data.status,
      deltakere: data.deltakere,
      location: data.latitude && data.longitude ? 
        JSON.stringify({
          latitude: Number(data.latitude),
          longitude: Number(data.longitude),
          name: data.locationName || data.arbeidssted || "Valgt lokasjon",
          weatherData: data.weatherData || null // Lagrer værdata-snapshot
        }) : 
        data.location,
    }

    // Håndter risikoer og tiltak hvis de er strukturerte Prisma-objekter
    if (data.risikoer && typeof data.risikoer === 'object' && 
       (data.risikoer.create || data.risikoer.update || data.risikoer.deleteMany)) {
      updateData.risikoer = data.risikoer
    } 
    // Fallback til gammel atferd hvis risikoer er et array
    else if (Array.isArray(data.risikoer)) {
      updateData.risikoer = {
        create: data.risikoer.map((r: any) => ({
          aktivitet: r.aktivitet,
          fare: r.fare,
          konsekvens: r.konsekvens || '',
          sannsynlighet: r.sannsynlighet,
          alvorlighet: r.alvorlighet,
          risikoVerdi: r.risikoVerdi
        }))
      }
    }

    // Håndter tiltak på samme måte
    if (data.tiltak && typeof data.tiltak === 'object' && 
       (data.tiltak.create || data.tiltak.update || data.tiltak.deleteMany)) {
      updateData.tiltak = data.tiltak
    }
    // Fallback til gammel atferd hvis tiltak er et array
    else if (Array.isArray(data.tiltak)) {
      updateData.tiltak = {
        create: data.tiltak.map((t: any) => ({
          beskrivelse: t.beskrivelse,
          ansvarlig: t.ansvarlig,
          status: t.status || "PLANLAGT",
          frist: t.frist ? new Date(t.frist) : null
        }))
      }
    }

    // Håndter bilder
    if (data.bilder) {
      if (data.bilder.create) {
        updateData.bilder = data.bilder
      } else if (Array.isArray(data.bilder)) {
        updateData.bilder = {
          create: data.bilder.map((url: string) => ({
            url: url
          }))
        }
      }
    }
    
    // Oppdater SJA
    const updatedSja = await prisma.sJA.update({
      where: { id: data.id },
      data: updateData,
      include: {
        risikoer: true,
        tiltak: true,
        produkter: true,
        bilder: true,
        opprettetAv: {
          select: {
            name: true,
            email: true,
            role: true
          }
        }
      }
    })
    
    // Invalider cache for den spesifikke SJA
    await invalidateCache(CacheGroup.SJA, data.id)
    
    // Invalider også liste-cachen siden rekkefølge/status kan ha endret seg
    await invalidateCache(CacheGroup.SJA)
    
    // Revalider SJA-relaterte paths for Next.js
    revalidatePath('/dashboard/sja')
    revalidatePath(`/dashboard/sja/${data.id}`)
    revalidatePath('/api/sja')
    revalidatePath(`/api/sja/${data.id}`)
    
    return NextResponse.json(updatedSja)
  } catch (error) {
    logger.error('Feil ved oppdatering av SJA', { error: error as Error })
    return NextResponse.json({ error: 'Kunne ikke oppdatere SJA' }, { status: 500 })
  }
}

// DELETE - Slett SJA med cache-invalidering
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Uautorisert' }, { status: 401 })
  }
  
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  
  if (!id) {
    return NextResponse.json({ error: 'SJA-ID mangler' }, { status: 400 })
  }
  
  const companyId = session.user.companyId
  if (!companyId) {
    return NextResponse.json({ error: 'Bedrifts-ID mangler' }, { status: 400 })
  }
  
  try {
    // Sjekk om SJA eksisterer og tilhører bedriften
    const existingSja = await prisma.sJA.findFirst({
      where: { id, companyId }
    })
    
    if (!existingSja) {
      return NextResponse.json({ error: 'SJA ikke funnet' }, { status: 404 })
    }
    
    // Slett SJA
    await prisma.sJA.delete({ where: { id } })
    
    // Invalider relaterte caches
    await invalidateCache(CacheGroup.SJA, id)
    await invalidateCache(CacheGroup.SJA)
    
    // Revalider SJA-relaterte paths for Next.js
    revalidatePath('/dashboard/sja')
    revalidatePath(`/dashboard/sja/${id}`)
    revalidatePath('/api/sja')
    
    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Feil ved sletting av SJA', { error: error as Error })
    return NextResponse.json({ error: 'Kunne ikke slette SJA' }, { status: 500 })
  }
} 