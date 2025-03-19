import { Job, Worker } from 'bullmq';
import { DaluxSyncService } from '../integrations/dalux/sync';
import { DaluxFieldApi } from '../integrations/dalux/api';
import { logger } from '../utils/logger';
import { getRedisConnection } from '../queue';

// Type-definisjoner for Dalux-jobber
export interface DaluxSyncDeviationJobData {
  type: 'syncDeviation';
  deviationId: string;
  projectId: string;
}

export interface DaluxSyncSJAJobData {
  type: 'syncSJA';
  sjaId: string;
  projectId: string;
}

export interface DaluxUploadImageJobData {
  type: 'uploadImage';
  projectId: string;
  issueId: string;
  imageUrl: string;
  fileName: string;
  deviationId?: string;
  sjaId?: string;
}

export type DaluxJobData = 
  | DaluxSyncDeviationJobData 
  | DaluxSyncSJAJobData 
  | DaluxUploadImageJobData;

/**
 * Type guards for å sjekke jobbtyper
 */
function isSyncDeviationJob(data: DaluxJobData): data is DaluxSyncDeviationJobData {
  return data.type === 'syncDeviation';
}

function isSyncSJAJob(data: DaluxJobData): data is DaluxSyncSJAJobData {
  return data.type === 'syncSJA';
}

function isUploadImageJob(data: DaluxJobData): data is DaluxUploadImageJobData {
  return data.type === 'uploadImage';
}

/**
 * Sjekker om Dalux-integrasjon er konfigurert
 */
function isDaluxConfigured(): boolean {
  return !!(
    process.env.DALUX_CLIENT_ID && 
    process.env.DALUX_CLIENT_SECRET && 
    process.env.DALUX_API_URL
  );
}

/**
 * Arbeider for å prosessere Dalux-relaterte jobber
 */
export async function startDaluxWorker(): Promise<Worker> {
  if (!isDaluxConfigured()) {
    logger.warn('Dalux integrasjon er ikke konfigurert. Dalux-arbeideren starter ikke.');
    // Opprett en dummy-worker som gjør ingenting
    return new Worker(
      'dalux',
      async () => {},
      getRedisConnection()
    );
  }
  
  logger.info('Starter Dalux-arbeider...');
  
  const worker = new Worker<DaluxJobData>(
    'dalux',
    async (job: Job<DaluxJobData>) => {
      const data = job.data;
      
      try {
        switch (data.type) {
          case 'syncDeviation':
            if (isSyncDeviationJob(data)) {
              await processSyncDeviationJob(job as Job<DaluxSyncDeviationJobData>);
            }
            break;
          case 'syncSJA':
            if (isSyncSJAJob(data)) {
              await processSyncSJAJob(job as Job<DaluxSyncSJAJobData>);
            }
            break;
          case 'uploadImage':
            if (isUploadImageJob(data)) {
              await processUploadImageJob(job as Job<DaluxUploadImageJobData>);
            }
            break;
          default:
            throw new Error(`Ukjent jobbtype: ${(data as any).type}`);
        }
      } catch (error) {
        logger.error(`Feil ved prosessering av Dalux-jobb: ${job.id}`, {
          error: error as Error,
          data: { jobId: job.id, jobType: data.type }
        });
        throw error; // Kast feilen videre så BullMQ kan håndtere retry
      }
    },
    {
      ...getRedisConnection(),
      concurrency: 5,
      limiter: {
        max: 10,
        duration: 1000 // 10 jobber per sekund maks
      }
    }
  );
  
  worker.on('completed', (job: Job<DaluxJobData>) => {
    logger.info(`Dalux-jobb fullført: ${job.id}`, {
      data: { jobId: job.id, jobType: job.data.type }
    });
  });
  
  worker.on('failed', (job: Job<DaluxJobData> | undefined, error: Error) => {
    logger.error(`Dalux-jobb feilet: ${job?.id}`, {
      error,
      data: job ? { jobId: job.id, jobType: job.data.type } : undefined
    });
  });
  
  return worker;
}

/**
 * Prosesserer en jobb for å synkronisere et avvik til Dalux
 */
async function processSyncDeviationJob(job: Job<DaluxSyncDeviationJobData>): Promise<void> {
  const { deviationId, projectId } = job.data;
  
  logger.info(`Prosesserer synkronisering av avvik ${deviationId} til Dalux`, {
    data: { jobId: job.id, deviationId, projectId }
  });
  
  const syncService = new DaluxSyncService();
  await syncService.syncDeviation(deviationId, projectId);
  
  logger.info(`Synkronisering av avvik ${deviationId} til Dalux fullført`, {
    data: { jobId: job.id, deviationId, projectId }
  });
}

/**
 * Prosesserer en jobb for å synkronisere en SJA til Dalux
 */
async function processSyncSJAJob(job: Job<DaluxSyncSJAJobData>): Promise<void> {
  const { sjaId, projectId } = job.data;
  
  logger.info(`Prosesserer synkronisering av SJA ${sjaId} til Dalux`, {
    data: { jobId: job.id, sjaId, projectId }
  });
  
  const syncService = new DaluxSyncService();
  await syncService.syncSJA(sjaId, projectId);
  
  logger.info(`Synkronisering av SJA ${sjaId} til Dalux fullført`, {
    data: { jobId: job.id, sjaId, projectId }
  });
}

/**
 * Prosesserer en jobb for å laste opp et bilde til Dalux
 */
async function processUploadImageJob(job: Job<DaluxUploadImageJobData>): Promise<void> {
  const { projectId, issueId, imageUrl, fileName, deviationId, sjaId } = job.data;
  
  logger.info(`Prosesserer opplasting av bilde til Dalux issue ${issueId}`, {
    data: { jobId: job.id, projectId, issueId, imageUrl }
  });

  try {
    // Last ned bildet først
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Kunne ikke laste ned bilde fra ${imageUrl}`);
    }

    // Konverter til base64
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');

    // Last opp til Dalux
    const api = new DaluxFieldApi();
    await api.addIssueAttachment(projectId, issueId, {
      fileName: fileName,
      mimeType: imageResponse.headers.get('content-type') || 'image/jpeg',
      data: base64Image
    });

    logger.info(`Bilde lastet opp til Dalux issue ${issueId}`, {
      data: { jobId: job.id, projectId, issueId, deviationId, sjaId }
    });
  } catch (error) {
    logger.error(`Feil ved opplasting av bilde til Dalux issue ${issueId}`, {
      error: error as Error,
      data: { jobId: job.id, projectId, issueId, imageUrl }
    });
    throw error;
  }
} 