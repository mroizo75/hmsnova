/**
 * Hjelpefunksjoner for å utføre batchoperasjoner mot databasen
 * Dette forbedrer ytelsen ved masseinnsetting og -oppdatering av data
 */

import prisma from "@/lib/db"
import logger from "@/lib/utils/logger"
import { Prisma } from "@prisma/client"

/**
 * Konstant for maksimal batchstørrelse
 * MySQL har en begrensning på antall parametre i en spørring
 */
const MAX_BATCH_SIZE = 1000

/**
 * Generisk funksjon for å utføre batchoperasjoner med Prisma
 * 
 * @param items Array med elementer som skal behandles
 * @param batchSize Maksimalt antall elementer per batch
 * @param operationFn Funksjon som utfører operasjonen for hver batch
 * @returns Samlet resultat fra alle batchoperasjoner
 */
export async function batchOperation<T, R>(
  items: T[],
  batchSize: number = MAX_BATCH_SIZE,
  operationFn: (batch: T[]) => Promise<R[]>
): Promise<R[]> {
  const batches: T[][] = []
  
  // Del opp elementene i batcher
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize))
  }
  
  logger.info('Starting batch operation', {
    context: 'batch-operations',
    data: {
      totalItems: items.length,
      batchCount: batches.length,
      batchSize
    }
  })
  
  // Utfør operasjoner for hver batch og samle resultatene
  const results: R[] = []
  
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i]
    logger.debug(`Processing batch ${i + 1} of ${batches.length}`, {
      context: 'batch-operations',
      data: { batchSize: batch.length }
    })
    
    try {
      const batchResults = await operationFn(batch)
      results.push(...batchResults)
    } catch (error) {
      logger.error(`Error processing batch ${i + 1}`, {
        context: 'batch-operations',
        error: error instanceof Error ? error : new Error(String(error))
      })
      throw error
    }
  }
  
  logger.info('Completed batch operation', {
    context: 'batch-operations',
    data: { totalProcessed: results.length }
  })
  
  return results
}

/**
 * Funksjon for masseinnsetting av avvik
 * 
 * @param deviations Array med avvik som skal settes inn
 * @param companyId ID for selskapet avvikene tilhører
 * @returns Array med innsatte avvik
 */
export async function createDeviationsBatch(
  deviations: Prisma.DeviationCreateManyInput[],
  companyId: string
): Promise<Prisma.BatchPayload> {
  logger.info('Creating deviations in batch', {
    context: 'batch-operations',
    data: { count: deviations.length, companyId }
  })
  
  // Sett companyId for alle avvik hvis ikke allerede satt
  const deviationsWithCompany = deviations.map(deviation => ({
    ...deviation,
    companyId: deviation.companyId || companyId
  }))
  
  try {
    // Bruk Prisma sin createMany for å sette inn alle avvik i én operasjon
    const result = await prisma.deviation.createMany({
      data: deviationsWithCompany,
      skipDuplicates: true
    })
    
    logger.info('Successfully created deviations in batch', {
      context: 'batch-operations',
      data: { count: result.count }
    })
    
    return result
  } catch (error) {
    logger.error('Error creating deviations in batch', {
      context: 'batch-operations',
      error: error instanceof Error ? error : new Error(String(error))
    })
    throw error
  }
}

/**
 * Funksjon for masseopprettelse av tiltak til avvik
 * 
 * @param measures Array med tiltak som skal settes inn
 * @param deviationId ID for avviket tiltakene tilhører
 * @returns Array med innsatte tiltak
 */
export async function createDeviationMeasuresBatch(
  measures: Prisma.DeviationMeasureCreateManyInput[],
  deviationId: string
): Promise<Prisma.BatchPayload> {
  logger.info('Creating deviation measures in batch', {
    context: 'batch-operations',
    data: { count: measures.length, deviationId }
  })
  
  // Sett deviationId for alle tiltak hvis ikke allerede satt
  const measuresWithDeviation = measures.map(measure => ({
    ...measure,
    deviationId: measure.deviationId || deviationId
  }))
  
  try {
    // Bruk Prisma sin createMany for å sette inn alle tiltak i én operasjon
    const result = await prisma.deviationMeasure.createMany({
      data: measuresWithDeviation,
      skipDuplicates: true
    })
    
    logger.info('Successfully created deviation measures in batch', {
      context: 'batch-operations',
      data: { count: result.count }
    })
    
    return result
  } catch (error) {
    logger.error('Error creating deviation measures in batch', {
      context: 'batch-operations',
      error: error instanceof Error ? error : new Error(String(error))
    })
    throw error
  }
}

/**
 * Funksjon for masseimportering av bilder til avvik
 * 
 * @param images Array med bilder som skal importeres
 * @returns Array med importerte bilder
 */
export async function importDeviationImagesBatch(
  images: Prisma.DeviationImageCreateManyInput[]
): Promise<Prisma.BatchPayload> {
  logger.info('Importing deviation images in batch', {
    context: 'batch-operations',
    data: { count: images.length }
  })
  
  try {
    // Bruk Prisma sin createMany for å sette inn alle bilder i én operasjon
    const result = await prisma.deviationImage.createMany({
      data: images,
      skipDuplicates: true
    })
    
    logger.info('Successfully imported deviation images in batch', {
      context: 'batch-operations',
      data: { count: result.count }
    })
    
    return result
  } catch (error) {
    logger.error('Error importing deviation images in batch', {
      context: 'batch-operations',
      error: error instanceof Error ? error : new Error(String(error))
    })
    throw error
  }
} 