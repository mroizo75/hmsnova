import { logger } from '@/lib/utils/logger';
import { cacheData, TTL } from '@/lib/cache/multi-level-cache';
import { CacheGroup } from '@/lib/cache/redis-cache';

interface DaluxAuthConfig {
  clientId: string;
  clientSecret: string;
  apiUrl: string;
  scope: string;
}

interface DaluxAuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  issued_at: number;
}

// Hent konfigurasjon fra miljøvariabler
export function getDaluxConfig(): DaluxAuthConfig {
  const config = {
    clientId: process.env.DALUX_CLIENT_ID || '',
    clientSecret: process.env.DALUX_CLIENT_SECRET || '',
    apiUrl: process.env.DALUX_API_URL || 'https://api.dalux.com',
    scope: process.env.DALUX_SCOPE || 'field.read field.write',
  };

  if (!config.clientId || !config.clientSecret) {
    throw new Error('Manglende Dalux API-konfigurasjon. Sett DALUX_CLIENT_ID og DALUX_CLIENT_SECRET.');
  }

  return config;
}

/**
 * Henter en gyldig tilgangstoken for Dalux API
 * Håndterer caching, fornyelse og feilhåndtering
 */
export async function getDaluxToken(): Promise<string> {
  try {
    return await cacheData<string>(
      CacheGroup.DALUX,
      async () => {
        const token = await getNewDaluxToken();
        return token.access_token;
      },
      {
        id: 'auth_token',
        ttl: TTL.SHORT, // Bruk kort cache-tid for tokens (1 minutt)
        useMemoryCache: true,
        useRedisCache: true,
        useNextCache: false, // Auth tokens bør ikke caches av Next.js
      }
    );
  } catch (error) {
    logger.error('Feil ved henting av Dalux-token', { error: error as Error });
    throw new Error('Kunne ikke autentisere mot Dalux API');
  }
}

/**
 * Henter et nytt token fra Dalux API
 */
async function getNewDaluxToken(): Promise<DaluxAuthToken> {
  const config = getDaluxConfig();
  
  const response = await fetch(`${config.apiUrl}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: config.clientId,
      client_secret: config.clientSecret,
      scope: config.scope,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error('Feil ved autentisering mot Dalux API', { 
      data: { 
        status: response.status, 
        statusText: response.statusText,
        error: errorText 
      } 
    });
    throw new Error(`Dalux API autentiseringsfeil: ${response.status} ${response.statusText}`);
  }

  const token = await response.json();
  
  // Legg til utstedelsestidspunkt for å spore når tokenet ble hentet
  token.issued_at = Date.now();
  
  return token;
}

/**
 * Sjekker om et token er gyldig og ikke utløpt
 */
export function isTokenValid(token: DaluxAuthToken): boolean {
  if (!token || !token.access_token) return false;
  
  const now = Date.now();
  const expiresAt = token.issued_at + (token.expires_in * 1000);
  
  // Legg til en buffer på 5 minutter for å unngå edge cases
  const bufferMs = 5 * 60 * 1000;
  
  return now < (expiresAt - bufferMs);
} 