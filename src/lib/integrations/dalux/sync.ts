import { logger } from '@/lib/utils/logger';
import prisma from '@/lib/db';
import { DaluxFieldApi, mapDeviationToDaluxIssue, mapSJAToDaluxIssue } from './api';
import { cacheData, invalidateCache, TTL } from '@/lib/cache/multi-level-cache';
import { CacheGroup } from '@/lib/cache/redis-cache';
import { addJob } from '@/lib/queue';

// Interface for synkroniseringsdata
interface SyncData {
  sourceId: string;       // ID i vårt system 
  targetId: string;       // ID i Dalux
  projectId: string;      // Dalux prosjekt ID
  entityType: 'deviation' | 'sja';
  lastSync: Date;         // Siste synkroniseringstidspunkt
  status: 'success' | 'error' | 'pending';
  error?: string;         // Eventuell feilmelding
}

/**
 * Synkroniseringstjeneste for Dalux-integrasjon
 */
export class DaluxSyncService {
  private api: DaluxFieldApi;

  constructor() {
    this.api = new DaluxFieldApi();
  }

  /**
   * Synkroniser et avvik til Dalux
   */
  async syncDeviation(deviationId: string, projectId: string): Promise<SyncData> {
    try {
      logger.info(`Starter synkronisering av avvik ${deviationId} til Dalux prosjekt ${projectId}`);
      
      // Hent avviket fra vår database
      const deviation = await prisma.deviation.findUnique({
        where: { id: deviationId },
        include: {
          reporter: {
            select: { id: true, name: true, email: true }
          },
          assignee: {
            select: { id: true, name: true, email: true }
          },
          images: true
        }
      });
      
      if (!deviation) {
        throw new Error(`Avvik med ID ${deviationId} ble ikke funnet`);
      }

      // Sjekk om avviket allerede er synkronisert til Dalux
      const existingSync = await prisma.integration.findFirst({
        where: {
          sourceId: deviationId,
          entityType: 'deviation',
          provider: 'dalux'
        }
      });

      // Konverter avvik til Dalux format
      const daluxIssue = mapDeviationToDaluxIssue(deviation);
      let daluxIssueId: string;
      let response: any;

      // Opprett eller oppdater i Dalux
      if (existingSync?.targetId) {
        // Oppdater eksisterende issue i Dalux
        daluxIssueId = existingSync.targetId;
        response = await this.api.updateIssue(projectId, daluxIssueId, daluxIssue);
        logger.info(`Oppdatert avvik i Dalux med ID ${daluxIssueId}`);
      } else {
        // Opprett nytt issue i Dalux
        response = await this.api.createIssue(projectId, daluxIssue);
        daluxIssueId = response.id;
        logger.info(`Opprettet nytt avvik i Dalux med ID ${daluxIssueId}`);
      }

      // Last opp bilder til Dalux hvis de finnes
      if (deviation.images && deviation.images.length > 0 && daluxIssueId) {
        // Last opp bildene asynkront
        for (const image of deviation.images) {
          await addJob('dalux', {
            type: 'uploadImage',
            projectId,
            issueId: daluxIssueId,
            imageUrl: image.url,
            fileName: `image_${image.id}.jpg`,
            deviationId: deviationId
          });
        }
      }

      // Lagre eller oppdater synkroniseringsdata
      const syncData = {
        sourceId: deviationId,
        targetId: daluxIssueId,
        projectId: projectId,
        entityType: 'deviation' as const,
        lastSync: new Date(),
        status: 'success' as const,
        error: null
      };

      if (existingSync) {
        await prisma.integration.update({
          where: { id: existingSync.id },
          data: {
            targetId: daluxIssueId,
            lastSync: syncData.lastSync,
            status: syncData.status,
            error: null
          }
        });
      } else {
        await prisma.integration.create({
          data: {
            sourceId: deviationId,
            targetId: daluxIssueId,
            projectId: projectId,
            entityType: 'deviation',
            provider: 'dalux',
            lastSync: syncData.lastSync,
            status: syncData.status,
            error: null
          }
        });
      }

      // Invalider cache for integrasjonsdata
      await invalidateCache(CacheGroup.DALUX, `deviation_${deviationId}`);

      return syncData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Feil ved synkronisering av avvik ${deviationId} til Dalux`, {
        error: error as Error,
        data: { deviationId, projectId }
      });

      // Registrer feilen i databasen
      await this.logSyncError(deviationId, 'deviation', projectId, errorMessage);

      return {
        sourceId: deviationId,
        targetId: '',
        projectId: projectId,
        entityType: 'deviation',
        lastSync: new Date(),
        status: 'error',
        error: errorMessage
      };
    }
  }

  /**
   * Synkroniser en SJA til Dalux
   */
  async syncSJA(sjaId: string, projectId: string): Promise<SyncData> {
    try {
      logger.info(`Starter synkronisering av SJA ${sjaId} til Dalux prosjekt ${projectId}`);
      
      // Hent SJA fra vår database
      const sja = await prisma.sJA.findUnique({
        where: { id: sjaId },
        include: {
          opprettetAv: {
            select: { id: true, name: true, email: true }
          },
          risikoer: true,
          tiltak: true,
          bilder: true
        }
      });
      
      if (!sja) {
        throw new Error(`SJA med ID ${sjaId} ble ikke funnet`);
      }

      // Sjekk om SJA-en allerede er synkronisert til Dalux
      const existingSync = await prisma.integration.findFirst({
        where: {
          sourceId: sjaId,
          entityType: 'sja',
          provider: 'dalux'
        }
      });

      // Konverter SJA til Dalux format
      const daluxIssue = mapSJAToDaluxIssue(sja);
      let daluxIssueId: string;
      let response: any;

      // Opprett eller oppdater i Dalux
      if (existingSync?.targetId) {
        // Oppdater eksisterende issue i Dalux
        daluxIssueId = existingSync.targetId;
        response = await this.api.updateIssue(projectId, daluxIssueId, daluxIssue);
        logger.info(`Oppdatert SJA i Dalux med ID ${daluxIssueId}`);
      } else {
        // Opprett nytt issue i Dalux
        response = await this.api.createIssue(projectId, daluxIssue);
        daluxIssueId = response.id;
        logger.info(`Opprettet ny SJA i Dalux med ID ${daluxIssueId}`);
      }

      // Last opp bilder til Dalux hvis de finnes
      if (sja.bilder && sja.bilder.length > 0 && daluxIssueId) {
        // Last opp bildene asynkront
        for (const bilde of sja.bilder) {
          await addJob('dalux', {
            type: 'uploadImage',
            projectId,
            issueId: daluxIssueId,
            imageUrl: bilde.url,
            fileName: `sja_image_${bilde.id}.jpg`,
            sjaId: sjaId
          });
        }
      }

      // Lagre eller oppdater synkroniseringsdata
      const syncData = {
        sourceId: sjaId,
        targetId: daluxIssueId,
        projectId: projectId,
        entityType: 'sja' as const,
        lastSync: new Date(),
        status: 'success' as const,
        error: null
      };

      if (existingSync) {
        await prisma.integration.update({
          where: { id: existingSync.id },
          data: {
            targetId: daluxIssueId,
            lastSync: syncData.lastSync,
            status: syncData.status,
            error: null
          }
        });
      } else {
        await prisma.integration.create({
          data: {
            sourceId: sjaId,
            targetId: daluxIssueId,
            projectId: projectId,
            entityType: 'sja',
            provider: 'dalux',
            lastSync: syncData.lastSync,
            status: syncData.status,
            error: null
          }
        });
      }

      // Invalider cache for integrasjonsdata
      await invalidateCache(CacheGroup.DALUX, `sja_${sjaId}`);

      return syncData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Feil ved synkronisering av SJA ${sjaId} til Dalux`, {
        error: error as Error,
        data: { sjaId, projectId }
      });

      // Registrer feilen i databasen
      await this.logSyncError(sjaId, 'sja', projectId, errorMessage);

      return {
        sourceId: sjaId,
        targetId: '',
        projectId: projectId,
        entityType: 'sja',
        lastSync: new Date(),
        status: 'error',
        error: errorMessage
      };
    }
  }

  /**
   * Logg synkroniseringsfeil til databasen
   */
  private async logSyncError(sourceId: string, entityType: 'deviation' | 'sja', projectId: string, errorMessage: string): Promise<void> {
    try {
      const existingSync = await prisma.integration.findFirst({
        where: {
          sourceId: sourceId,
          entityType: entityType,
          provider: 'dalux'
        }
      });

      if (existingSync) {
        await prisma.integration.update({
          where: { id: existingSync.id },
          data: {
            lastSync: new Date(),
            status: 'error',
            error: errorMessage
          }
        });
      } else {
        await prisma.integration.create({
          data: {
            sourceId: sourceId,
            targetId: '',
            projectId: projectId,
            entityType: entityType,
            provider: 'dalux',
            lastSync: new Date(),
            status: 'error',
            error: errorMessage
          }
        });
      }

      // Invalider cache
      await invalidateCache(CacheGroup.DALUX, `${entityType}_${sourceId}`);
    } catch (error) {
      logger.error(`Feil ved logging av synkroniseringsfeil til database`, {
        error: error as Error
      });
    }
  }

  /**
   * Hent status for synkronisering
   */
  async getSyncStatus(sourceId: string, entityType: 'deviation' | 'sja'): Promise<any> {
    return cacheData(
      CacheGroup.DALUX,
      async () => {
        return prisma.integration.findFirst({
          where: {
            sourceId: sourceId,
            entityType: entityType,
            provider: 'dalux'
          }
        });
      },
      {
        id: `${entityType}_${sourceId}`,
        ttl: TTL.MEDIUM // 10 minutter
      }
    );
  }

  /**
   * Hent liste over alle synkroniserte ressurser
   */
  async getAllSyncedResources(entityType?: 'deviation' | 'sja'): Promise<any[]> {
    return cacheData(
      CacheGroup.DALUX,
      async () => {
        const where = entityType ? { entityType, provider: 'dalux' } : { provider: 'dalux' };
        return prisma.integration.findMany({
          where,
          orderBy: { lastSync: 'desc' }
        });
      },
      {
        id: entityType ? `all_${entityType}` : 'all_resources',
        ttl: TTL.MEDIUM // 10 minutter
      }
    );
  }
  
  /**
   * Synkroniser alle avvik for en bedrift
   */
  async syncAllDeviations(companyId: string, projectId: string, options?: { 
    status?: string, 
    limit?: number,
    createdAfter?: Date
  }): Promise<{ success: number, errors: number, total: number }> {
    const where: any = { companyId };
    
    if (options?.status) {
      where.status = options.status;
    }
    
    if (options?.createdAfter) {
      where.createdAt = { gte: options.createdAfter };
    }
    
    // Hent deviations som skal synkroniseres
    const deviations = await prisma.deviation.findMany({
      where,
      take: options?.limit,
      orderBy: { updatedAt: 'desc' },
      select: { id: true }
    });
    
    let success = 0;
    let errors = 0;
    
    // Synkroniser hver deviation i en queue
    for (const deviation of deviations) {
      try {
        await addJob('dalux', {
          type: 'syncDeviation',
          deviationId: deviation.id,
          projectId
        });
        success++;
      } catch (error) {
        logger.error(`Feil ved opprettelse av sync-jobb for avvik ${deviation.id}`, {
          error: error as Error
        });
        errors++;
      }
    }
    
    return { success, errors, total: deviations.length };
  }
  
  /**
   * Synkroniser alle SJA-er for en bedrift
   */
  async syncAllSJAs(companyId: string, projectId: string, options?: { 
    status?: string, 
    limit?: number,
    createdAfter?: Date
  }): Promise<{ success: number, errors: number, total: number }> {
    const where: any = { companyId };
    
    if (options?.status) {
      where.status = options.status;
    }
    
    if (options?.createdAfter) {
      where.opprettetDato = { gte: options.createdAfter };
    }
    
    // Hent SJA-er som skal synkroniseres
    const sjas = await prisma.sJA.findMany({
      where,
      take: options?.limit,
      orderBy: { oppdatertDato: 'desc' },
      select: { id: true }
    });
    
    let success = 0;
    let errors = 0;
    
    // Synkroniser hver SJA i en queue
    for (const sja of sjas) {
      try {
        await addJob('dalux', {
          type: 'syncSJA',
          sjaId: sja.id,
          projectId
        });
        success++;
      } catch (error) {
        logger.error(`Feil ved opprettelse av sync-jobb for SJA ${sja.id}`, {
          error: error as Error
        });
        errors++;
      }
    }
    
    return { success, errors, total: sjas.length };
  }
} 