import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DaluxFieldApi } from '@/lib/integrations/dalux/api';
import { DaluxSyncService } from '@/lib/integrations/dalux/sync';
import { addJob } from '@/lib/queue';
import { logger } from '@/lib/utils/logger';

// GET - Hent prosjekter fra Dalux
export async function GET(request: NextRequest) {
  try {
    // Sjekk autentisering
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Uautorisert' }, { status: 401 });
    }
    
    // Sjekk om brukeren har admin-rettigheter
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Utilstrekkelige rettigheter' }, { status: 403 });
    }
    
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'projects';
    
    const api = new DaluxFieldApi();
    const syncService = new DaluxSyncService();
    
    // Håndter ulike actions
    switch (action) {
      case 'projects':
        // Hent prosjekter fra Dalux
        const projects = await api.getProjects();
        return NextResponse.json({ projects });
        
      case 'issues':
        // Hent issues for et prosjekt
        const projectId = searchParams.get('projectId');
        if (!projectId) {
          return NextResponse.json({ error: 'projectId er påkrevd' }, { status: 400 });
        }
        
        const status = searchParams.get('status') || undefined;
        const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined;
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
        
        const issues = await api.getIssues(projectId, { status, page, limit });
        return NextResponse.json({ issues });
        
      case 'sync_status':
        // Hent synkroniseringsstatus
        const entityId = searchParams.get('id');
        const entityType = searchParams.get('type') as 'deviation' | 'sja';
        
        if (!entityId || !entityType) {
          return NextResponse.json({ error: 'id og type er påkrevd' }, { status: 400 });
        }
        
        if (entityType !== 'deviation' && entityType !== 'sja') {
          return NextResponse.json({ error: 'Ugyldig type. Må være "deviation" eller "sja"' }, { status: 400 });
        }
        
        const syncStatus = await syncService.getSyncStatus(entityId, entityType);
        return NextResponse.json({ syncStatus });
        
      case 'all_synced':
        // Hent alle synkroniserte ressurser
        const type = searchParams.get('type') as 'deviation' | 'sja' | undefined;
        const syncedResources = await syncService.getAllSyncedResources(type);
        return NextResponse.json({ syncedResources });
        
      default:
        return NextResponse.json({ error: 'Ugyldig action' }, { status: 400 });
    }
  } catch (error) {
    logger.error('Feil i Dalux integrasjon API', { error: error as Error });
    return NextResponse.json({ error: 'Feil ved kommunikasjon med Dalux' }, { status: 500 });
  }
}

// POST - Synkroniser data til Dalux
export async function POST(request: NextRequest) {
  try {
    // Sjekk autentisering
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Uautorisert' }, { status: 401 });
    }
    
    // Sjekk om brukeren har admin-rettigheter
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Utilstrekkelige rettigheter' }, { status: 403 });
    }
    
    // Parse request body
    const data = await request.json();
    const { action, projectId } = data;
    
    if (!action) {
      return NextResponse.json({ error: 'action er påkrevd' }, { status: 400 });
    }
    
    if (!projectId) {
      return NextResponse.json({ error: 'projectId er påkrevd' }, { status: 400 });
    }
    
    switch (action) {
      case 'sync_deviation':
        // Synkroniser et enkelt avvik
        const deviationId = data.deviationId;
        if (!deviationId) {
          return NextResponse.json({ error: 'deviationId er påkrevd' }, { status: 400 });
        }
        
        // Legg til synkroniseringsjobb i køen
        await addJob('dalux' as 'deviations' | 'notifications' | 'imageProcessing' | 'pdfGeneration', {
          type: 'syncDeviation',
          deviationId,
          projectId
        });
        
        return NextResponse.json({ 
          message: `Synkronisering av avvik ${deviationId} startet`,
          jobStatus: 'queued'
        });
        
      case 'sync_sja':
        // Synkroniser en enkelt SJA
        const sjaId = data.sjaId;
        if (!sjaId) {
          return NextResponse.json({ error: 'sjaId er påkrevd' }, { status: 400 });
        }
        
        // Legg til synkroniseringsjobb i køen
        await addJob('dalux' as 'deviations' | 'notifications' | 'imageProcessing' | 'pdfGeneration', {
          type: 'syncSJA',
          sjaId,
          projectId
        });
        
        return NextResponse.json({ 
          message: `Synkronisering av SJA ${sjaId} startet`,
          jobStatus: 'queued'
        });
        
      case 'sync_all_deviations':
        // Synkroniser alle avvik for bedriften
        const syncService = new DaluxSyncService();
        const deviationOptions = {
          status: data.status,
          limit: data.limit,
          createdAfter: data.createdAfter ? new Date(data.createdAfter) : undefined
        };
        
        const deviationResult = await syncService.syncAllDeviations(
          session.user.companyId!,
          projectId,
          deviationOptions
        );
        
        return NextResponse.json({ 
          message: `Synkronisering av ${deviationResult.total} avvik startet`,
          result: deviationResult
        });
        
      case 'sync_all_sjas':
        // Synkroniser alle SJA-er for bedriften
        const sjaService = new DaluxSyncService();
        const sjaOptions = {
          status: data.status,
          limit: data.limit,
          createdAfter: data.createdAfter ? new Date(data.createdAfter) : undefined
        };
        
        const sjaResult = await sjaService.syncAllSJAs(
          session.user.companyId!,
          projectId,
          sjaOptions
        );
        
        return NextResponse.json({ 
          message: `Synkronisering av ${sjaResult.total} SJA-er startet`,
          result: sjaResult
        });
        
      default:
        return NextResponse.json({ error: 'Ugyldig action' }, { status: 400 });
    }
  } catch (error) {
    logger.error('Feil i Dalux integrasjon API', { error: error as Error });
    return NextResponse.json({ error: 'Feil ved kommunikasjon med Dalux' }, { status: 500 });
  }
} 