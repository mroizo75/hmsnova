import { createNotification } from "@/lib/services/notification-service"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"
import { uploadToStorage } from "@/lib/storage"
import { DeviationType, Severity, Status } from "@prisma/client"
import logger from "@/lib/utils/logger"
import { unstable_cache } from 'next/cache'
import { withTimeout, withTimeoutAndRetry } from "@/lib/utils/api-timeout"
import { addJob } from "@/lib/queue"
import { DeviationJobData } from "@/lib/queue/deviation-worker"
import { ImageProcessingJobData } from "@/lib/queue/image-worker"
import { invalidateCache, cacheData, TTL } from '@/lib/cache/multi-level-cache';
import { CacheGroup } from '@/lib/cache/redis-cache';
import { revalidatePath } from 'next/cache';

// Definer zod schema som bruker Prisma-enum for validering
const StatusSchema = z.nativeEnum(Status)

const createDeviationSchema = z.object({
  title: z.string().min(1, "Tittel er påkrevd"),
  description: z.string().min(1, "Beskrivelse er påkrevd"),
  type: z.nativeEnum(DeviationType),
  category: z.string().min(1, "Kategori er påkrevd"),
  severity: z.nativeEnum(Severity),
  status: StatusSchema.default(Status.OPEN),
  location: z.string().optional(),
  dueDate: z.string().optional().nullable(),
  images: z.array(z.string()).optional().default([])
})

// Definere returtype for parseFormData for å fikse TypeScript-feil
interface ParsedFormData {
  success: boolean;
  error?: string;
  title: string;
  description: string;
  type: string;
  category: string;
  severity: string;
  location: string;
  dueDate: string | null;
  status: Status;
  images: never[];
  imageFile?: File;
  equipmentId?: string;
  maintenanceRequired?: string;
}

async function parseFormData(req: Request): Promise<ParsedFormData> {
  try {
    logger.debug('Starting parseFormData...', { context: 'deviations-api' })
    const formData = await req.formData()
    
    // Log alle felt fra formData
    const formDataFields: Record<string, any> = {}
    for (const [key, value] of formData.entries()) {
      formDataFields[key] = value
    }
    logger.debug('FormData fields received', { context: 'deviations-api', data: formDataFields })
    
    // Sjekk at alle påkrevde felt er tilstede
    const title = formData.get('title')
    const description = formData.get('description')
    const type = formData.get('type')
    const category = formData.get('category')
    const severity = formData.get('severity')
    
    // Log påkrevde felt
    logger.debug('Required fields', { 
      context: 'deviations-api', 
      data: { title, description, type, category, severity }
    })
    
    // Sjekk om obligatoriske felter mangler
    if (!title || !description || !type || !category || !severity) {
      return {
        success: false,
        error: "Alle påkrevde felt må fylles ut",
        title: "",
        description: "",
        type: "",
        category: "",
        severity: "",
        location: "",
        dueDate: null,
        status: Status.OPEN,
        images: []
      };
    }

    // Håndter bildefil
    const imageFile = formData.get('image') as File | null;

    const parsedData: ParsedFormData = {
      success: true,
      title: title?.toString() || '',
      description: description?.toString() || '',
      type: type?.toString() || '',
      category: category?.toString() || '',
      severity: severity?.toString() || '',
      location: formData.get('location')?.toString() || '',
      dueDate: formData.get('dueDate')?.toString() || null,
      status: Status.OPEN,
      images: [],
      imageFile: imageFile || undefined,
      equipmentId: formData.get('equipmentId')?.toString(),
      maintenanceRequired: formData.get('maintenanceRequired')?.toString() 
    }

    logger.debug('Parsed form data', { context: 'deviations-api', data: parsedData })
    return parsedData
  } catch (error) {
    logger.error('Error in parseFormData', { 
      context: 'deviations-api', 
      error: error instanceof Error ? error : new Error(String(error))
    })
    return {
      success: false,
      error: "Feil ved parsing av formdata",
      title: "",
      description: "",
      type: "",
      category: "",
      severity: "",
      location: "",
      dueDate: null,
      status: Status.OPEN,
      images: []
    }
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "Du må være logget inn for å opprette avvik" },
        { status: 401 }
      )
    }

    logger.info('POST /api/deviations - Starting', { context: 'deviations-api' })

    // Parse form data fra request
    const data = await parseFormData(req)
    if (!data.success) {
      return NextResponse.json(
        { error: data.error || "Ugyldig data" },
        { status: 400 }
      )
    }
    
    // Behandle bildet hvis det finnes
    const imageFile = data.imageFile
    
    if (imageFile) {
      logger.info('Image file included in request', { 
        context: 'deviations-api',
        data: { 
          fileName: imageFile.name,
          fileSize: imageFile.size
        }
      })
    }

    // Først oppretter vi avviket
    const deviation = await prisma.deviation.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type as DeviationType,
        category: data.category,
        severity: data.severity as Severity,
        location: data.location,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        status: Status.OPEN,
        reportedBy: session.user.id,
        companyId: session.user.companyId,
        equipmentId: data.equipmentId,
        maintenanceRequired: data.maintenanceRequired === 'true'
      },
      include: {
        company: true
      }
    })

    logger.info('Deviation created successfully', { 
      context: 'deviations-api',
      data: { deviationId: deviation.id }
    })

    // Legg til avviksjobb i køen
    const jobData: DeviationJobData = {
      deviationId: deviation.id,
      action: 'process',
      userId: session.user.id,
      additionalData: {
        source: 'web-api',
        reporterEmail: session.user.email
      }
    };
    
    const deviationJobId = await addJob('deviations', jobData);
    
    logger.info('Added deviation to processing queue', {
      context: 'deviations-api',
      data: { 
        deviationId: deviation.id,
        jobId: deviationJobId
      }
    });

    // Så laster vi opp bildet med den nye stien og legger det i bildeprosesseringskøen
    if (imageFile) {
      logger.info('Uploading image for deviation', { 
        context: 'deviations-api',
        data: { 
          deviationId: deviation.id,
          fileName: imageFile.name,
          fileSize: imageFile.size
        }
      })
      
      // Nå bruker vi deviationId i stien
      const path = `deviations/${deviation.id}/images/${imageFile.name}`
      const imageUrl = await uploadToStorage(imageFile, path, session.user.companyId)
      
      const deviationImage = await prisma.deviationImage.create({
        data: {
          url: imageUrl,
          deviationId: deviation.id,
          uploadedBy: session.user.id
        }
      })
      
      logger.info('Image uploaded successfully', { 
        context: 'deviations-api',
        data: { imageUrl }
      })
      
      // Legg til bildeprosesseringsjobb i køen
      const imageJobData: ImageProcessingJobData = {
        imageId: deviationImage.id,
        sourceUrl: imageUrl,
        formats: ['webp', 'jpeg'],
        sizes: [
          { width: 800, suffix: 'large' },
          { width: 400, suffix: 'medium' },
          { width: 200, suffix: 'thumbnail' }
        ],
        metadata: {
          deviationId: deviation.id,
          fileName: imageFile.name
        }
      };
      
      const imageJobId = await addJob('imageProcessing', imageJobData);
      
      logger.info('Added image to processing queue', {
        context: 'deviations-api',
        data: { 
          imageId: deviationImage.id,
          jobId: imageJobId
        }
      });
    }

    // Send notifikasjoner asynkront via kø
    logger.info('Adding notification job to queue', { context: 'deviations-api' })
    
    const notifyJobData: DeviationJobData = {
      deviationId: deviation.id,
      action: 'notify',
      additionalData: {
        notificationType: 'new-deviation'
      }
    };
    
    await addJob('deviations', notifyJobData);

    // Invalidér cache for avvik
    await invalidateCache(CacheGroup.DEVIATIONS);
    
    // Revalidér relaterte sider
    revalidatePath('/dashboard/deviations');
    revalidatePath('/api/deviations');

    // Returnerer det opprettede avviket
    return NextResponse.json(deviation)
  } catch (error: any) {
    logger.error("Feil ved oppretting av avvik", { 
      context: 'deviations-api',
      error
    })
    return NextResponse.json(
      { error: "Kunne ikke opprette avvik: " + error.message },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    logger.info('Processing GET request for deviations', { context: 'deviations-api' })
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session?.user?.companyId) {
      logger.warn('Unauthorized access attempt', { 
        context: 'deviations-api',
        data: { ip: req.headers.get('x-forwarded-for') || 'unknown' }
      })
      return new NextResponse(
        JSON.stringify({ success: false, error: "Ikke autorisert" }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Hent URL-parametere for paginering og filtrering
    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const status = url.searchParams.get('status')
    const type = url.searchParams.get('type')
    const onlyMine = url.searchParams.get('onlyMine') === 'true'
    
    logger.debug('Query parameters', { 
      context: 'deviations-api', 
      data: { page, limit, status, type, onlyMine }
    })
    
    // Bygg opp where-betingelser basert på filtre
    const where: any = {
      companyId: session.user.companyId,
    }
    
    // Legg til filtre hvis de er spesifisert
    if (status) where.status = status
    if (type) where.type = type
    if (onlyMine) where.reportedBy = session.user.id
    
    logger.debug('Query filters', { 
      context: 'deviations-api', 
      data: { where }
    })
    
    // Bruk caching for å hente data
    const data = await cacheData(
      CacheGroup.DEVIATIONS,
      async () => {
        // Bruk timeout og retry for databaseoperasjoner
        return await withTimeoutAndRetry(
          async () => {
            // Hent totalt antall avvik for paginering med timeout
            const totalCount = await withTimeout(
              prisma.deviation.count({ where }),
              5000, // 5 sekunder timeout
              'Henting av antall avvik tok for lang tid'
            )
            
            // Beregn offset for paginering
            const skip = (page - 1) * limit
            
            // Hent avvik med paginering og filtrering med timeout
            const deviations = await withTimeout(
              prisma.deviation.findMany({
                where,
                include: {
                  // Begrens inkluderte data til kun det som er nødvendig
                  images: {
                    select: {
                      id: true,
                      url: true
                    },
                    take: 1 // Begrens til kun ett bilde per avvik for listevisning
                  }
                },
                orderBy: {
                  createdAt: 'desc'
                },
                skip,
                take: limit
              }),
              8000, // 8 sekunder timeout
              'Henting av avvik tok for lang tid'
            )
            
            // Beregn metadata for paginering
            const totalPages = Math.ceil(totalCount / limit)
            const hasMore = page < totalPages
            
            return {
              deviations,
              pagination: {
                page,
                limit,
                totalCount,
                totalPages,
                hasMore
              }
            }
          },
          {
            timeoutMs: 10000, // 10 sekunder total timeout
            retries: 3,
            delayMs: 500,
            errorMessage: 'Henting av avvik feilet'
          }
        )
      },
      {
        params: { page, limit, status, type, onlyMine },
        ttl: TTL.SHORT, // 1 minutt (avvik oppdateres ofte)
        useMemoryCache: true,
        useNextCache: true,
        useRedisCache: true,
      }
    )
    
    logger.info('Deviations fetched successfully', { 
      context: 'deviations-api',
      data: { 
        count: data.deviations.length,
        totalCount: data.pagination.totalCount,
        page: data.pagination.page,
        totalPages: data.pagination.totalPages,
        fromCache: true
      }
    })
    
    return new NextResponse(
      JSON.stringify({ 
        success: true, 
        data: data.deviations,
        pagination: data.pagination
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Ukjent feil"
    logger.error('Error fetching deviations', { 
      context: 'deviations-api', 
      error: error instanceof Error ? error : new Error(String(error))
    })
    
    // Spesifikk håndtering av timeoutfeil
    const isTimeout = errorMessage.includes('Timeout') || errorMessage.includes('tok for lang tid')
    
    return new NextResponse(
      JSON.stringify({ 
        success: false, 
        error: isTimeout ? "Forespørselen tok for lang tid" : "Kunne ikke hente avvik",
        details: errorMessage 
      }),
      { status: isTimeout ? 504 : 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
} 