import { Worker, Job } from 'bullmq';
import prisma from '@/lib/db';
import { getRedisConnection } from './index';
import { logger } from '@/lib/utils/logger';
import { Status } from '@prisma/client';
import { createNotification } from '@/lib/services/notification-service';
import { getIO } from '@/lib/socket/store';

export interface DeviationJobData {
  deviationId: string;
  action: 'process' | 'notify' | 'generate-report';
  userId?: string;
  additionalData?: Record<string, any>;
}

// Oppretter en arbeider for å behandle avvik
export function createDeviationWorker() {
  const worker = new Worker<DeviationJobData>(
    'deviations',
    async (job: Job<DeviationJobData>) => {
      const { deviationId, action, userId, additionalData } = job.data;
      
      logger.info(`Starter prosessering av avvik ${deviationId} med handling ${action}`, {
        context: 'deviation-worker',
        data: {
          jobId: job.id?.toString(),
          deviationId,
          action
        }
      });
      
      try {
        switch (action) {
          case 'process':
            await processDeviation(deviationId, additionalData);
            break;
          case 'notify':
            await notifyAboutDeviation(deviationId, userId);
            break;
          case 'generate-report':
            await generateDeviationReport(deviationId);
            break;
          default:
            throw new Error(`Ukjent handling: ${action}`);
        }
        
        logger.info(`Fullført prosessering av avvik ${deviationId} med handling ${action}`, {
          context: 'deviation-worker',
          data: {
            jobId: job.id?.toString(),
            deviationId,
            action,
            success: true
          }
        });
        
        return { success: true, deviationId, action };
      } catch (error: any) {
        logger.error(`Feil under prosessering av avvik ${deviationId}`, {
          context: 'deviation-worker',
          data: {
            jobId: job.id?.toString(),
            deviationId, 
            action
          },
          error
        });
        
        throw error;
      }
    },
    {
      connection: getRedisConnection().connection,
      concurrency: 5, // Antall samtidige jobber
      limiter: {
        max: 50,        // Maks antall jobber per tidsperiode
        duration: 60000 // Tidsperiode i millisekunder (1 minutt)
      }
    }
  );
  
  // Håndter hendelser
  worker.on('completed', (job) => {
    logger.info(`Avviksjobb fullført: ${job?.id}`, {
      context: 'deviation-worker'
    });
  });
  
  worker.on('failed', (job, err) => {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error(`Avviksjobb mislyktes: ${job?.id}`, {
      context: 'deviation-worker',
      error
    });
  });
  
  return worker;
}

// Implementer faktiske prosesseringsfunksjoner
async function processDeviation(deviationId: string, additionalData?: Record<string, any>) {
  // Hent gjeldende avvik for å få tilgang til data
  const existingDeviation = await prisma.deviation.findUnique({
    where: { id: deviationId }
  });
  
  if (!existingDeviation) {
    throw new Error(`Avvik med ID ${deviationId} ikke funnet`);
  }
  
  // Oppdater avviket med ny status
  await prisma.deviation.update({
    where: { id: deviationId },
    data: {
      status: Status.IN_PROGRESS,
      updatedAt: new Date(),
      // Legg til et statushistorikk-innslag
      statusHistory: {
        create: {
          status: Status.IN_PROGRESS.toString(),
          updatedBy: 'SYSTEM',
          comment: 'Automatisk prosessering startet'
        }
      }
    }
  });
  
  // Lagre tilleggsdata som tiltak hvis nødvendig
  if (additionalData && Object.keys(additionalData).length > 0) {
    // Logg tilleggsdata
    logger.info(`Prosesserer tilleggsdata for avvik ${deviationId}`, {
      context: 'deviation-worker',
      data: { deviationId, additionalDataKeys: Object.keys(additionalData) }
    });
    
    // Lagre tilleggsdata som et tiltak om nødvendig
    if (additionalData.note) {
      await prisma.deviationMeasure.create({
        data: {
          description: additionalData.note,
          type: 'ADMINISTRATIVE',  // Standard type
          priority: 'MEDIUM',      // Standard prioritet
          deviationId: deviationId,
          createdBy: additionalData.userId || 'SYSTEM'
        }
      });
    }
  }
  
  // Simulerer tung prosessering
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return true;
}

async function notifyAboutDeviation(deviationId: string, userId?: string) {
  // Hent avviket
  const deviation = await prisma.deviation.findUnique({
    where: { id: deviationId }
  });
  
  if (!deviation) {
    throw new Error(`Avvik med ID ${deviationId} ikke funnet`);
  }
  
  try {
    logger.info(`Oppretter notifikasjoner for avvik: ${deviation.title}`, {
      context: 'deviation-worker',
      data: {
        deviationId,
        title: deviation.title
      }
    });
    
    // Hent bedriftens admin-brukere
    const companyUsers = await prisma.user.findMany({
      where: {
        companyId: deviation.companyId,
        role: 'COMPANY_ADMIN'
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });
    
    // Hent bruker som rapporterte avviket
    const reportedByUser = await prisma.user.findUnique({
      where: { id: deviation.reportedBy },
      select: {
        id: true,
        name: true,
        email: true
      }
    });
    
    // Opprett notifikasjoner for alle bedriftens brukere
    const notificationPromises = [];
    
    if (companyUsers.length > 0) {
      for (const user of companyUsers) {
        // Ikke send notifikasjon til den som rapporterte avviket
        if (user.id === deviation.reportedBy) continue;
        
        const notificationPromise = createNotification({
          title: 'Nytt avvik registrert',
          message: `Nytt avvik "${deviation.title}" er registrert av ${reportedByUser?.name || 'en bruker'}.`,
          type: 'deviation',
          userId: user.id,
          link: `/dashboard/deviations/${deviation.id}`
        });
        
        notificationPromises.push(notificationPromise);
      }
    }
    
    // Vent på at alle notifikasjoner er opprettet
    await Promise.all(notificationPromises);
    
    // Send Socket.io-hendelse til alle brukere i bedriften
    const io = getIO();
    if (io) {
      const deviationData = {
        id: deviation.id,
        title: deviation.title, 
        severity: deviation.severity,
        status: deviation.status,
        createdAt: deviation.createdAt,
        reportedBy: reportedByUser
      };
      
      // Send til bedriftsrommet
      io.to(`company-${deviation.companyId}`).emit('deviation:created', deviationData);
      
      logger.info(`Socket.io-hendelse sendt for avvik ${deviationId}`, {
        context: 'deviation-worker',
        data: {
          deviationId,
          companyId: deviation.companyId
        }
      });
    } else {
      logger.warn(`Socket.io ikke tilgjengelig for å sende hendelse for avvik ${deviationId}`, {
        context: 'deviation-worker'
      });
    }
    
    logger.info(`Notifikasjoner opprettet for avvik ${deviationId}`, {
      context: 'deviation-worker',
      data: {
        deviationId,
        count: notificationPromises.length
      }
    });
    
    return true;
  } catch (error) {
    logger.error(`Feil ved oppretting av notifikasjoner for avvik ${deviationId}`, {
      context: 'deviation-worker',
      error: error instanceof Error ? error : new Error(String(error))
    });
    
    // Ikke kast feilen videre - vi vil ikke at jobben skal feile helt
    // hvis notifikasjonene ikke kunne opprettes
    return false;
  }
}

async function generateDeviationReport(deviationId: string) {
  // Simulerer generering av rapport
  logger.info(`Genererer rapport for avvik: ${deviationId}`, {
    context: 'deviation-worker',
    data: { deviationId }
  });
  
  // Simulerer tungprosessering
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  return true;
} 