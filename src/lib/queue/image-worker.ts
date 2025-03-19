import { Worker, Job } from 'bullmq';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { getRedisConnection } from './index';
import { logger } from '@/lib/utils/logger';

export interface ImageProcessingJobData {
  imageId: string;
  sourceUrl: string;
  destinationPath?: string;
  formats?: Array<'webp' | 'jpeg' | 'png' | 'avif'>;
  sizes?: Array<{ width: number; height?: number; suffix: string }>;
  quality?: number;
  metadata?: Record<string, any>;
}

// Oppretter en arbeider for å behandle bildeoptimalisering
export function createImageWorker() {
  const worker = new Worker<ImageProcessingJobData>(
    'image-processing',
    async (job: Job<ImageProcessingJobData>) => {
      const { imageId, sourceUrl, formats = ['webp'], sizes, quality = 80, metadata } = job.data;
      
      logger.info(`Starter bildebehandling for ${imageId}`, {
        context: 'image-worker',
        data: {
          jobId: job.id?.toString(),
          imageId,
          sourceUrl
        }
      });
      
      try {
        // Hent bildet
        let imageBuffer: Buffer;
        
        if (sourceUrl.startsWith('http')) {
          // Last ned bilde fra URL
          const response = await fetch(sourceUrl);
          if (!response.ok) {
            throw new Error(`Kunne ikke laste ned bildet: ${response.statusText}`);
          }
          imageBuffer = Buffer.from(await response.arrayBuffer());
        } else {
          // Les bilde fra filsystem
          imageBuffer = await fs.readFile(sourceUrl);
        }
        
        // Opprett destinasjonsmappe hvis den ikke finnes
        const destinationDir = job.data.destinationPath || path.join(process.cwd(), 'public', 'images', 'processed');
        await fs.mkdir(destinationDir, { recursive: true });
        
        const results = [];
        
        // Behandle i forskjellige formater
        for (const format of formats) {
          if (!sizes || sizes.length === 0) {
            // Behandle originalbilde uten resizing
            const outputPath = path.join(destinationDir, `${imageId}.${format}`);
            
            await sharp(imageBuffer)
              [format]({ quality })
              .toFile(outputPath);
            
            results.push({
              format,
              path: outputPath,
              size: 'original'
            });
          } else {
            // Behandle i forskjellige størrelser
            for (const size of sizes) {
              const outputPath = path.join(
                destinationDir, 
                `${imageId}-${size.suffix}.${format}`
              );
              
              await sharp(imageBuffer)
                .resize({
                  width: size.width,
                  height: size.height,
                  fit: 'inside',
                  withoutEnlargement: true
                })
                [format]({ quality })
                .toFile(outputPath);
              
              results.push({
                format,
                path: outputPath,
                size: size.suffix,
                width: size.width,
                height: size.height
              });
            }
          }
        }
        
        logger.info(`Fullført bildebehandling for ${imageId}`, {
          context: 'image-worker',
          data: {
            jobId: job.id?.toString(),
            imageId,
            results: results.map(r => ({ format: r.format, size: r.size }))
          }
        });
        
        return {
          success: true,
          imageId,
          results,
          metadata
        };
      } catch (error: any) {
        logger.error(`Feil under bildebehandling for ${imageId}`, {
          context: 'image-worker',
          data: {
            jobId: job.id?.toString(),
            imageId
          },
          error: error
        });
        
        throw error;
      }
    },
    {
      connection: getRedisConnection().connection,
      concurrency: 2, // Bildebehandling er ressurskrevende, så begrenset antall samtidige jobber
      limiter: {
        max: 20,         // Maks antall jobber per tidsperiode
        duration: 60000  // Tidsperiode i millisekunder (1 minutt)
      }
    }
  );
  
  // Håndter hendelser
  worker.on('completed', (job) => {
    logger.info(`Bildejobb fullført: ${job?.id}`, {
      context: 'image-worker'
    });
  });
  
  worker.on('failed', (job, err) => {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error(`Bildejobb mislyktes: ${job?.id}`, {
      context: 'image-worker',
      error
    });
  });
  
  return worker;
} 