import { Queue, Worker, QueueOptions } from 'bullmq';
import IORedis from 'ioredis';
import { createDeviationWorker } from './deviation-worker';
import { createImageWorker } from './image-worker';
import { startDaluxWorker } from './dalux-worker';
import { createSJAWorker } from './sja-worker';

// Konfigurer Redis-tilkobling
export const getRedisConnection = (): QueueOptions => {
  // Sjekk om vi skal bruke fallback
  if (process.env.REDIS_FALLBACK === 'true') {
    console.log('REDIS_FALLBACK er satt - kø-funksjonalitet vil være begrenset');
    return {
      connection: {
        // Dummy-implementering som ikke gjør noe
        emit: () => {},
        on: () => {},
        once: () => {},
        disconnect: () => {},
      } as any
    };
  }

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  
  // Konfigurer tilkoblingsopsjoner basert på om vi bruker Upstash eller lokal Redis
  const isUpstash = redisUrl.includes('upstash.io');
  
  const connectionOptions: any = {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    reconnectOnError: (err: Error) => {
      const targetError = 'READONLY';
      if (err.message.includes(targetError)) {
        // Koble til ny node hvis feil oppstår
        return true; 
      }
      return false;
    }
  };
  
  // Legg til TLS-opsjoner for Upstash
  if (isUpstash) {
    connectionOptions.tls = {
      rejectUnauthorized: false
    };
  }

  try {
    const connection = new IORedis(redisUrl, connectionOptions);
    
    // Håndter tilkoblingsfeil
    connection.on('error', (err) => {
      console.error(`Redis-tilkoblingsfeil: ${err.message}`);
      if (err.message.includes('ENOTFOUND') || err.message.includes('ECONNREFUSED')) {
        console.warn('Redis-server ikke tilgjengelig - jobber vil ikke bli lagt i kø');
      }
    });
    
    // Håndter tilkobling
    connection.on('connect', () => {
      console.log('Tilkoblet Redis-server');
    });
    
    return { connection };
  } catch (error) {
    console.error(`Kunne ikke opprette Redis-tilkobling: ${error instanceof Error ? error.message : String(error)}`);
    // Returner en dummy-tilkobling som ikke vil kaste feil
    return {
      connection: {
        emit: () => {},
        on: () => {},
        once: () => {},
        disconnect: () => {},
      } as any
    };
  }
};

// Eksporter køer for bruk i applikasjonen
export const queues = {
  deviations: new Queue('deviations', getRedisConnection()),
  imageProcessing: new Queue('image-processing', getRedisConnection()),
  pdfGeneration: new Queue('pdf-generation', getRedisConnection()),
  notifications: new Queue('notifications', getRedisConnection()),
  dalux: new Queue('dalux', getRedisConnection()),
  sjaFiles: new Queue('sja-files', getRedisConnection())
};

// Start arbeidere
export const workers = {
  deviations: createDeviationWorker(),
  imageProcessing: createImageWorker(),
  dalux: startDaluxWorker(),
  sjaFiles: createSJAWorker()
};

// Funksjon for å legge til jobb i en kø
export async function addJob<T>(queueName: keyof typeof queues, jobData: T, options?: any): Promise<string> {
  try {
    // Generer et jobb-ID for tilfelle vi ikke kan koble til Redis
    const fallbackJobId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Legg til standard retry-strategi hvis ikke spesifisert
    const defaultOptions = {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000
      },
      removeOnComplete: true,
      removeOnFail: false
    };

    const finalOptions = { ...defaultOptions, ...options };
    
    try {
      const job = await queues[queueName].add(queueName.toString(), jobData, finalOptions);
      const jobId = job.id?.toString() || fallbackJobId;
      console.log(`Jobb lagt til i ${queueName} kø med ID: ${jobId}`);
      return jobId;
    } catch (error) {
      // Hvis vi får en tilkoblingsfeil, logg bare en advarsel og fortsett
      if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
        console.warn(`Redis ikke tilgjengelig for ${queueName} kø. Fortsetter uten å legge jobben i kø.`);
        console.warn(`Jobb-data:`, jobData);
        return fallbackJobId;
      }
      // Ellers kast feilen videre
      throw error;
    }
  } catch (error) {
    console.error(`Feil ved legging til jobb i ${queueName} kø:`, error);
    throw error;
  }
}

// Liste over aktive arbeidere
let activeWorkers: Worker[] = [];

// Funksjon for å starte arbeidere i produksjonsmiljø
// (ikke kall denne i API-ruter, bare i separate arbeiderprosesser)
export async function startWorkers() {
  // Ikke start i utviklingsmiljø med mindre ENABLE_WORKERS er satt
  if (process.env.NODE_ENV !== 'production' && process.env.ENABLE_WORKERS !== 'true') {
    console.log('Arbeidere starter bare i produksjonsmiljø eller når ENABLE_WORKERS=true');
    return;
  }
  
  console.log('Starter køarbeidere...');
  
  // Start avviksarbeideren
  const deviationWorker = createDeviationWorker();
  activeWorkers.push(deviationWorker);
  console.log('Avviksarbeider startet');
  
  // Start bildebehandlingsarbeideren
  const imageWorker = createImageWorker();
  activeWorkers.push(imageWorker);
  console.log('Bildebehandlingsarbeider startet');
  
  // Start Dalux-arbeideren
  try {
    const daluxWorker = await startDaluxWorker();
    activeWorkers.push(daluxWorker);
    console.log('Dalux-arbeider startet');
  } catch (error) {
    console.error('Feil ved start av Dalux-arbeider:', error);
    console.log('Dalux-arbeider ikke startet på grunn av feil');
  }
  
  // Senere kan vi legge til flere arbeidere her
  console.log(`Totalt ${activeWorkers.length} arbeidere startet`);
}

// Funksjon for å stoppe alle arbeidere
export async function stopWorkers() {
  console.log('Stopper alle arbeidere...');
  
  const closePromises = activeWorkers.map(worker => worker.close());
  await Promise.all(closePromises);
  
  activeWorkers = [];
  console.log('Alle arbeidere stoppet');
} 