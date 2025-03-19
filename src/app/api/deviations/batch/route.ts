import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { NextResponse } from "next/server"
import { z } from "zod"
import { DeviationType, Prisma, Severity, Status } from "@prisma/client"
import logger from "@/lib/utils/logger"
import { createDeviationsBatch, createDeviationMeasuresBatch } from "@/lib/db/batch-operations"

// Valideringsskjema for enkelt avvik i batch
const deviationSchema = z.object({
  title: z.string().min(1, "Tittel er påkrevd"),
  description: z.string().min(1, "Beskrivelse er påkrevd"),
  type: z.nativeEnum(DeviationType),
  category: z.string().min(1, "Kategori er påkrevd"),
  severity: z.nativeEnum(Severity),
  location: z.string().optional(),
  measures: z.array(
    z.object({
      title: z.string().min(1, "Tiltakstittel er påkrevd"),
      description: z.string().optional(),
      dueDate: z.string().optional().nullable(),
      assignedTo: z.string().optional().nullable()
    })
  ).optional()
})

// Valideringsskjema for hele batch-forespørselen
const batchImportSchema = z.object({
  deviations: z.array(deviationSchema).min(1, "Minst ett avvik er påkrevd"),
  skipDuplicates: z.boolean().optional().default(true)
})

/**
 * API-rute for batchimport av avvik
 * 
 * Denne ruten muliggjør import av flere avvik i én operasjon
 * Dette er mer effektivt enn å opprette dem én og én
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session?.user?.companyId) {
      logger.warn('Unauthorized access attempt for batch import', { 
        context: 'deviations-batch-api'
      })
      return NextResponse.json(
        { success: false, error: "Ikke autorisert" },
        { status: 401 }
      )
    }

    // Parse og valider inndata
    const body = await req.json()
    const validationResult = batchImportSchema.safeParse(body)
    
    if (!validationResult.success) {
      logger.warn('Invalid batch import data', {
        context: 'deviations-batch-api',
        data: { errors: validationResult.error.format() }
      })
      return NextResponse.json(
        { 
          success: false, 
          error: "Ugyldig data", 
          details: validationResult.error.format() 
        },
        { status: 400 }
      )
    }
    
    const { deviations: deviationsData, skipDuplicates } = validationResult.data
    
    logger.info('Starting batch import of deviations', {
      context: 'deviations-batch-api',
      data: { 
        count: deviationsData.length,
        companyId: session.user.companyId,
        userId: session.user.id
      }
    })
    
    // Forbered avvikene for import
    const deviations: Prisma.DeviationCreateManyInput[] = deviationsData.map(deviation => ({
      title: deviation.title,
      description: deviation.description,
      type: deviation.type,
      category: deviation.category,
      severity: deviation.severity,
      location: deviation.location || null,
      status: Status.OPEN,
      reportedBy: session.user.id,
      companyId: session.user.companyId
    }))
    
    // Utfør batchimport av avvik
    const result = await createDeviationsBatch(deviations, session.user.companyId)
    
    logger.info('Successfully imported deviations in batch', {
      context: 'deviations-batch-api',
      data: { count: result.count }
    })
    
    return NextResponse.json(
      { 
        success: true, 
        data: { 
          count: result.count
        } 
      },
      { status: 201 }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger.error('Error importing deviations in batch', {
      context: 'deviations-batch-api',
      error: error instanceof Error ? error : new Error(errorMessage)
    })
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Kunne ikke importere avvik",
        details: errorMessage
      },
      { status: 500 }
    )
  }
} 