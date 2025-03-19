import { Worker, Job } from 'bullmq';
import prisma from '@/lib/db';
import { getRedisConnection } from './index';
import { logger } from '@/lib/utils/logger';
import { uploadToStorage } from '@/lib/storage';
import { addJob } from './index';

export interface SJAJobData {
  sjaId: string;
  companyId: string;
  action: 'upload-files' | 'process' | 'notify';
  additionalData?: {
    fileName?: string;
    buffer?: string;
    contentType?: string;
    size?: number;
    uploadedBy?: string;
    beskrivelse?: string;
  };
}

export function createSJAWorker() {
  const worker = new Worker<SJAJobData>(
    'sja-files',
    async (job: Job<SJAJobData>) => {
      const { sjaId, companyId, action, additionalData } = job.data;
      
      logger.info(`Starter prosessering av SJA ${sjaId} med handling ${action}`, {
        context: 'sja-worker',
        data: {
          jobId: job.id?.toString(),
          sjaId,
          action,
          companyId
        }
      });
      
      try {
        switch (action) {
          case 'upload-files':
            if (!additionalData?.buffer || !additionalData?.fileName) {
              throw new Error('Manglende filinformasjon');
            }

            // Konverter base64 buffer til File
            const buffer = Buffer.from(additionalData.buffer, 'base64');
            const file = new File(
              [buffer],
              additionalData.fileName,
              { type: additionalData.contentType }
            );

            // Valider filstørrelse
            if (file.size > 10 * 1024 * 1024) { // 10MB
              throw new Error('Filen er for stor (maks 10MB)');
            }

            // Valider filtype
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
            if (!allowedTypes.includes(file.type)) {
              throw new Error('Ugyldig filtype');
            }

            // Last opp filen
            const path = `sja/${sjaId}/images/${additionalData.fileName}`;
            const imageUrl = await uploadToStorage(
              file,
              path,
              companyId
            );

            if (!imageUrl) {
              throw new Error('Kunne ikke laste opp filen');
            }

            // Lagre bildeinformasjon i databasen
            const image = await prisma.sJABilde.create({
              data: {
                url: imageUrl,
                sjaId: sjaId,
                lastetOppAvId: additionalData.uploadedBy || 'system',
                beskrivelse: additionalData.beskrivelse || '',
                lastetOppDato: new Date()
              }
            });

            // Legg til bildeoptimaliseringsjobb
            await addJob('imageProcessing', {
              imageId: image.id,
              sourceUrl: imageUrl,
              formats: ['webp', 'jpeg'],
              sizes: [
                { width: 800, suffix: 'large' },
                { width: 400, suffix: 'medium' },
                { width: 200, suffix: 'thumbnail' }
              ],
              metadata: {
                sjaId: sjaId,
                fileName: additionalData.fileName
              }
            });

            logger.info(`Fil lastet opp og lagret for SJA ${sjaId}`, {
              context: 'sja-worker',
              data: {
                jobId: job.id?.toString(),
                sjaId,
                fileName: additionalData.fileName,
                imageId: image.id
              }
            });
            break;

          case 'process':
            // Håndter annen SJA-prosessering her
            logger.info(`Prosessering av SJA ${sjaId}`, {
              context: 'sja-worker',
              data: {
                jobId: job.id?.toString(),
                sjaId
              }
            });
            break;

          case 'notify':
            // Håndter varsling her
            logger.info(`Varsling for SJA ${sjaId}`, {
              context: 'sja-worker',
              data: {
                jobId: job.id?.toString(),
                sjaId
              }
            });
            break;

          default:
            throw new Error(`Ukjent handling: ${action}`);
        }
        
        return { success: true, sjaId, action };
      } catch (error: any) {
        logger.error(`Feil under prosessering av SJA ${sjaId}`, {
          context: 'sja-worker',
          data: {
            jobId: job.id?.toString(),
            sjaId, 
            action
          },
          error: error instanceof Error ? error : new Error(String(error))
        });
        
        throw error;
      }
    },
    {
      connection: getRedisConnection().connection,
      concurrency: 5,
      limiter: {
        max: 50,
        duration: 60000
      }
    }
  );
  
  worker.on('completed', (job) => {
    logger.info(`SJA-jobb fullført: ${job?.id}`, {
      context: 'sja-worker',
      data: {
        jobId: job?.id?.toString(),
        sjaId: job?.data?.sjaId
      }
    });
  });
  
  worker.on('failed', (job, err) => {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error(`SJA-jobb mislyktes: ${job?.id}`, {
      context: 'sja-worker',
      data: {
        jobId: job?.id?.toString(),
        sjaId: job?.data?.sjaId
      },
      error
    });
  });
  
  return worker;
} 