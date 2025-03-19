import { unstable_cache } from 'next/cache';
import { logger } from '@/lib/utils/logger';
import { getWithCache, setCacheItem, CacheGroup, generateCacheKey } from './redis-cache';

// Cache TTL-konfigurasjon (i sekunder)
export const TTL = {
  SHORT: 60, // 1 minutt
  MEDIUM: 60 * 10, // 10 minutter
  LONG: 60 * 60, // 1 time
  VERY_LONG: 60 * 60 * 24, // 24 timer
};

// In-memory cache
const memoryCache = new Map<string, { data: any; expires: number }>();

/**
 * Rengjør utgått data fra minnecache
 */
const cleanupExpiredMemoryCache = () => {
  const now = Date.now();
  for (const [key, { expires }] of memoryCache.entries()) {
    if (now > expires) {
      memoryCache.delete(key);
    }
  }
};

// Kjør opprydding hver 5. minutt istedenfor hvert minutt for å redusere CPU-bruk
setInterval(cleanupExpiredMemoryCache, 5 * 60 * 1000);

/**
 * Henter data fra minne-cache
 */
const getFromMemoryCache = <T>(key: string): T | null => {
  const cached = memoryCache.get(key);
  if (!cached) return null;

  const now = Date.now();
  if (now > cached.expires) {
    memoryCache.delete(key);
    return null;
  }

  return cached.data as T;
};

/**
 * Setter data i minne-cache
 */
const setInMemoryCache = <T>(key: string, data: T, ttlSeconds: number): void => {
  const expires = Date.now() + ttlSeconds * 1000;
  memoryCache.set(key, { data, expires });
};

/**
 * Flernivå cache funksjon som først sjekker minne-cache, deretter Redis, og til slutt henter nye data
 */
export async function cacheData<T>(
  cacheGroup: CacheGroup,
  fetchFn: () => Promise<T>,
  options: {
    id?: string | null;
    params?: Record<string, any>;
    ttl?: number;
    useMemoryCache?: boolean;
    useNextCache?: boolean;
    useRedisCache?: boolean;
    revalidateOnError?: boolean;
  } = {}
): Promise<T> {
  const {
    id = null,
    params = {},
    ttl = TTL.MEDIUM,
    useMemoryCache = true,
    useNextCache = true, 
    useRedisCache = true,
    revalidateOnError = true
  } = options;

  const cacheKey = generateCacheKey(cacheGroup, id, params);
  let data: T | null = null;
  const startTime = Date.now();

  // Steg 1: Sjekk minne-cache (raskest)
  if (useMemoryCache) {
    data = getFromMemoryCache<T>(cacheKey);
    if (data) {
      // Fjernet loggmelding for å redusere antall loggmeldinger
      return data;
    }
  }

  try {
    // Direkte datahenting funksjon
    async function fetchAndCacheData(): Promise<T> {
      const freshData = await fetchFn();
      
      // Lagre umiddelbart i minnecache for å redusere fremtidige Redis-oppslag
      if (freshData && useMemoryCache) {
        setInMemoryCache(cacheKey, freshData, ttl);
      }
      
      return freshData;
    }
    
    // Steg 2: Sjekk Next.js cache (nest raskest, på tvers av serverless funksjoner)
    if (useNextCache) {
      const cachedDataFn = unstable_cache(
        async () => {
          // Steg 3: Sjekk Redis cache (distribuert cache)
          if (useRedisCache) {
            try {
              const redisData = await getWithCache<T>(cacheGroup, id, params, fetchAndCacheData, ttl);
              return redisData;
            } catch (error) {
              logger.warn(`Redis cache feil for: ${cacheKey}`, { error: error as Error });
              // Fallback til direkte datahenting hvis Redis feiler
              return await fetchAndCacheData();
            }
          } else {
            // Hopp over Redis og hent data direkte
            return await fetchAndCacheData();
          }
        },
        [cacheKey],
        { revalidate: ttl }
      );

      data = await cachedDataFn();
    } else if (useRedisCache) {
      // Steg 3: Bruk bare Redis cache hvis Next.js cache er deaktivert
      data = await getWithCache<T>(cacheGroup, id, params, fetchAndCacheData, ttl);
    } else {
      // Steg 4: Hopp over all cache og hent ferske data
      data = await fetchAndCacheData();
    }

    // Fjernet debug-logging her for å redusere antall loggmeldinger
    return data;
  } catch (error) {
    logger.error(`Feil ved henting av data for: ${cacheKey}`, { error: error as Error });
    
    // Ved feil, prøv å hente ferske data direkte hvis ønskelig
    if (revalidateOnError) {
      try {
        // Behold denne loggen siden den er viktig for feilsøking
        logger.info(`Henter ferske data etter cache-feil: ${cacheKey}`);
        return await fetchFn();
      } catch (fetchError) {
        logger.error(`Kunne ikke hente ferske data etter cache-feil: ${cacheKey}`, {
          error: fetchError as Error
        });
        throw fetchError;
      }
    }
    
    throw error;
  }
}

/**
 * Invaliderer cache på alle nivåer (minne, Next.js via revalidatePath, og Redis)
 */
export async function invalidateCache(
  cacheGroup: CacheGroup,
  id?: string | null,
  params?: Record<string, any>
): Promise<void> {
  const cacheKey = id || params 
    ? generateCacheKey(cacheGroup, id || null, params || {})
    : null;
  
  // Rydd i minne-cache
  if (cacheKey) {
    // Slett spesifikk nøkkel
    memoryCache.delete(cacheKey);
  } else {
    // Slett alle nøkler i gruppen
    for (const key of memoryCache.keys()) {
      if (key.startsWith(`app:cache:${cacheGroup}`)) {
        memoryCache.delete(key);
      }
    }
  }

  // For Next.js oppdaterer vi path via revalidatePath i route handlers
  // Dette gjøres vanligvis i API-rutene som endrer data

  // Rydd i Redis cache
  if (cacheKey) {
    await setCacheItem(cacheKey, null, 0); // Sett TTL til 0 for å fjerne
  } else {
    // Invalider hele gruppen i Redis
    const { invalidateCacheGroup } = await import('./redis-cache');
    await invalidateCacheGroup(cacheGroup);
  }
} 