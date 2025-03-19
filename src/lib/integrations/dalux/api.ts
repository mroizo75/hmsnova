import { logger } from '@/lib/utils/logger';
import { getDaluxToken, getDaluxConfig } from './auth';
import { withTimeout } from '@/lib/utils/api-timeout';

/**
 * Basisklasse for API-kall mot Dalux
 */
export class DaluxApiClient {
  private baseUrl: string;
  
  constructor() {
    const config = getDaluxConfig();
    this.baseUrl = config.apiUrl;
  }
  
  /**
   * Utfør et HTTP-kall mot Dalux API
   */
  protected async request<T>(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any
  ): Promise<T> {
    try {
      const token = await getDaluxToken();
      
      const headers: HeadersInit = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      
      const options: RequestInit = {
        method,
        headers,
      };
      
      if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
      }
      
      // Bruk withTimeout for å sette en grense på 30 sekunder for API-kall
      const response = await withTimeout(
        fetch(`${this.baseUrl}${endpoint}`, options),
        30000,
        `Dalux API forespørsel tok for lang tid: ${method} ${endpoint}`
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Dalux API feil (${response.status}): ${errorText}`);
      }
      
      return await response.json() as T;
    } catch (error) {
      logger.error(`Feil ved Dalux API-kall: ${method} ${endpoint}`, { 
        error: error as Error,
        data: { method, endpoint, requestData: data }
      });
      throw error;
    }
  }
}

/**
 * Dalux Field API for håndtering av avvik (issues)
 */
export class DaluxFieldApi extends DaluxApiClient {
  /**
   * Hent alle prosjekter fra Dalux Field
   */
  async getProjects() {
    return this.request<any[]>('/api/v1/field/projects');
  }
  
  /**
   * Hent et spesifikt prosjekt fra Dalux Field
   */
  async getProject(projectId: string) {
    return this.request<any>(`/api/v1/field/projects/${projectId}`);
  }
  
  /**
   * Hent alle issues (avvik) for et prosjekt
   */
  async getIssues(projectId: string, params?: { status?: string; page?: number; limit?: number }) {
    let endpoint = `/api/v1/field/projects/${projectId}/issues`;
    
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.status) queryParams.append('status', params.status);
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      
      if (queryParams.toString()) {
        endpoint += `?${queryParams.toString()}`;
      }
    }
    
    return this.request<any[]>(endpoint);
  }
  
  /**
   * Hent et spesifikt issue (avvik) fra et prosjekt
   */
  async getIssue(projectId: string, issueId: string) {
    return this.request<any>(`/api/v1/field/projects/${projectId}/issues/${issueId}`);
  }
  
  /**
   * Opprett et nytt issue (avvik) i et prosjekt
   */
  async createIssue(projectId: string, issueData: DaluxIssueData) {
    return this.request<any>(
      `/api/v1/field/projects/${projectId}/issues`, 
      'POST', 
      issueData
    );
  }
  
  /**
   * Oppdater et eksisterende issue (avvik) i et prosjekt
   */
  async updateIssue(projectId: string, issueId: string, issueData: Partial<DaluxIssueData>) {
    return this.request<any>(
      `/api/v1/field/projects/${projectId}/issues/${issueId}`, 
      'PUT', 
      issueData
    );
  }
  
  /**
   * Legg til et bilde til et issue (avvik)
   */
  async addIssueAttachment(projectId: string, issueId: string, imageData: { fileName: string, mimeType: string, data: string }) {
    return this.request<any>(
      `/api/v1/field/projects/${projectId}/issues/${issueId}/attachments`,
      'POST',
      imageData
    );
  }
}

/**
 * Dataobjekter for Dalux Field API
 */
export interface DaluxIssueData {
  title: string;
  description: string;
  status: 'created' | 'inprogress' | 'resolved' | 'closed';
  type: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string;
  location?: string;
  dueDate?: string; // ISO-format dato
  customFields?: Record<string, any>;
}

/**
 * Kartlegg avvik fra vårt system til Dalux format
 */
export function mapDeviationToDaluxIssue(deviation: any): DaluxIssueData {
  // Kartlegg statusverdier fra vårt system til Dalux
  const statusMap: Record<string, 'created' | 'inprogress' | 'resolved' | 'closed'> = {
    'OPEN': 'created',
    'IN_PROGRESS': 'inprogress',
    'RESOLVED': 'resolved',
    'CLOSED': 'closed'
  };
  
  // Kartlegg alvorlighetsverdier fra vårt system til Dalux
  const severityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
    'LOW': 'low',
    'MEDIUM': 'medium',
    'HIGH': 'high',
    'CRITICAL': 'critical'
  };
  
  return {
    title: deviation.title,
    description: deviation.description,
    status: statusMap[deviation.status] || 'created',
    type: deviation.type || 'DEVIATION',
    severity: severityMap[deviation.severity] || 'medium',
    assignedTo: deviation.assignee?.email,
    location: deviation.location,
    dueDate: deviation.dueDate,
    customFields: {
      internal_id: deviation.id,
      reportedBy: deviation.reporter?.name,
      reportedAt: deviation.createdAt,
      sourceSystem: 'Internal HSE System'
    }
  };
}

/**
 * Kartlegg SJA fra vårt system til Dalux format
 * Merk: SJA kan kartlegges til Dalux-checklister eller -issues avhengig av hvordan Dalux brukes
 */
export function mapSJAToDaluxIssue(sja: any): DaluxIssueData {
  // Kartlegg statusverdier fra SJA til Dalux
  const statusMap: Record<string, 'created' | 'inprogress' | 'resolved' | 'closed'> = {
    'PLANLAGT': 'created',
    'PÅGÅENDE': 'inprogress',
    'FULLFØRT': 'resolved',
    'KANSELLERT': 'closed'
  };
  
  // Beregn alvorlighet basert på høyeste risiko i SJA
  let maxRisk = 0;
  if (sja.risikoer && sja.risikoer.length > 0) {
    maxRisk = Math.max(...sja.risikoer.map((r: any) => r.risikoVerdi || 0));
  }
  
  // Kartlegg risikoverdi til alvorlighet
  let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
  if (maxRisk <= 4) severity = 'low';
  else if (maxRisk <= 9) severity = 'medium';
  else if (maxRisk <= 16) severity = 'high';
  else severity = 'critical';
  
  // Bygge beskrivelsestekst som inneholder risikofaktorer
  let description = sja.beskrivelse || '';
  
  if (sja.risikoer && sja.risikoer.length > 0) {
    description += '\n\nRisikofaktorer:\n';
    sja.risikoer.forEach((r: any, index: number) => {
      description += `${index + 1}. ${r.aktivitet} - ${r.fare} (Risikoverdi: ${r.risikoVerdi})\n`;
    });
  }
  
  return {
    title: `SJA: ${sja.tittel}`,
    description: description,
    status: statusMap[sja.status] || 'created',
    type: 'SJA',
    severity: severity,
    assignedTo: sja.opprettetAv?.email,
    location: sja.arbeidssted,
    dueDate: sja.startDato,
    customFields: {
      internal_id: sja.id,
      startDate: sja.startDato,
      endDate: sja.sluttDato,
      createdBy: sja.opprettetAv?.name,
      createdAt: sja.opprettetDato,
      sourceSystem: 'Internal HSE System'
    }
  };
} 