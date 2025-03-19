import Redis from 'ioredis';
import { logger } from '@/lib/utils/logger';

// Standardinnstillinger for cache
// Økt til 3 timer for å redusere antall Redis-spørringer
const DEFAULT_TTL = 60 * 60 * 3; // 3 timer i sekunder
const CACHE_PREFIX = 'app:cache:';

// Sjekk om vi er i utviklingsmiljø
const isDevelopment = process.env.NODE_ENV === 'development';

// Enkel in-memory cache
const memoryCache: Record<string, { data: string; expires: number }> = {};

// Variabler for Redis-tilkobling
let redisClient: Redis | null = null;
let redisEnabled = !isDevelopment; // Deaktiver Redis automatisk i utviklingsmiljø

/**
 * Returnerer Redis-klienten hvis tilgjengelig, eller null hvis ikke
 */
const getRedisClient = (): Redis | null => {
  // Hvis vi er i utviklingsmiljø eller Redis er deaktivert, ikke prøv å koble til
  if (isDevelopment || !redisEnabled) {
    return null;
  }

  if (!redisClient) {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      
      // Endret konfigurasjonen for å redusere antall forespørsler og håndtere timeouts bedre
      redisClient = new Redis(redisUrl, {
        maxRetriesPerRequest: null, // Bruk standardverdi istedenfor å begrense til 1
        enableReadyCheck: false,
        connectTimeout: 1000, // 1 sek timeout for tilkobling
        commandTimeout: 3000, // 3 sek timeout for kommandoer
        retryStrategy: (times) => {
          // Maks 3 forsøk med eksponentiell backoff
          if (times > 3) return null;
          return Math.min(times * 100, 3000); // Maks 3 sekunders ventetid
        }
      });

      redisClient.on('error', (err) => {
        logger.error('Redis tilkoblingsfeil:', { error: err });
        // Deaktiver Redis ved tilkoblingsfeil
        redisEnabled = false;
        if (redisClient) {
          redisClient.disconnect();
          redisClient = null;
        }
      });

      redisClient.on('connect', () => {
        logger.info('Redis tilkoblet');
      });
    } catch (error) {
      logger.error('Feil ved oppretting av Redis-klient:', { error: error as Error });
      redisEnabled = false;
      redisClient = null;
    }
  }
  return redisClient;
};

/**
 * Lagrer et element i in-memory cache
 */
const setMemoryCacheItem = <T>(key: string, data: T, ttl: number): void => {
  memoryCache[key] = {
    data: JSON.stringify(data),
    expires: Date.now() + ttl * 1000
  };
};

/**
 * Henter et element fra in-memory cache
 */
const getMemoryCacheItem = <T>(key: string): T | null => {
  const item = memoryCache[key];
  if (!item) return null;
  
  if (item.expires < Date.now()) {
    delete memoryCache[key];
    return null;
  }
  
  return JSON.parse(item.data) as T;
};

/**
 * Fjerner et element fra in-memory cache
 */
const deleteMemoryCacheItem = (key: string): void => {
  delete memoryCache[key];
};

/**
 * Fjerner alle elementer fra in-memory cache som matcher et prefix
 */
const deleteMemoryCacheByPrefix = (prefix: string): void => {
  Object.keys(memoryCache).forEach(key => {
    if (key.startsWith(prefix)) {
      delete memoryCache[key];
    }
  });
};

// Logger en gang ved oppstart hvilken caching-metode som brukes
if (isDevelopment) {
  logger.info('Utviklingsmiljø oppdaget - bruker kun minnebasert caching');
} else {
  logger.info('Produksjonsmiljø - bruker Redis hvis tilgjengelig, ellers minnebasert caching');
}

/**
 * Cache-grupper for relaterte data
 * Brukes for å invalidere relaterte cache-elementer samtidig
 */
export enum CacheGroup {
  DEVIATIONS = 'deviations',
  SJA = 'sja',
  USERS = 'users',
  COMPANIES = 'companies',
  EQUIPMENT = 'equipment',
  DALUX = 'dalux',
  WEATHER = 'weather',
}

/**
 * Genererer en cache-nøkkel basert på gruppe, ID og eventuelle parametere
 */
export const generateCacheKey = (
  group: CacheGroup,
  id: string | null = null,
  params: Record<string, any> = {}
): string => {
  let key = `${CACHE_PREFIX}${group}`;
  
  if (id) {
    key += `:${id}`;
  }
  
  // Legg til sorterte parametere for konsistente nøkler
  const sortedParams = Object.keys(params).sort();
  if (sortedParams.length > 0) {
    const paramString = sortedParams
      .map(k => `${k}=${encodeURIComponent(String(params[k]))}`)
      .join('&');
    key += `:${paramString}`;
  }
  
  return key;
};

/**
 * Lagrer data i cache (Redis hvis tilgjengelig, ellers memory)
 */
export const setCacheItem = async <T>(
  key: string,
  data: T,
  ttl: number = DEFAULT_TTL
): Promise<boolean> => {
  try {
    const redis = getRedisClient();
    
    if (redis) {
      // Bruk Redis hvis tilgjengelig
      const serializedData = JSON.stringify(data);
      await redis.set(key, serializedData, 'EX', ttl);
      // Redusert logging - logger bare ved feilsituasjoner
    } else {
      // Fallback til minnebasert cache
      setMemoryCacheItem(key, data, ttl);
    }
    return true;
  } catch (error) {
    // Ved feil i Redis, bruk minnebasert cache
    logger.error(`Feil ved caching i Redis: ${key}`, { error: error as Error });
    setMemoryCacheItem(key, data, ttl);
    logger.debug(`Feilsikring: Cache lagret i minne: ${key}`);
    return true;
  }
};

/**
 * Henter data fra cache (Redis hvis tilgjengelig, ellers memory)
 */
export const getCacheItem = async <T>(key: string): Promise<T | null> => {
  try {
    const redis = getRedisClient();
    
    if (redis) {
      // Prøv Redis først
      const data = await redis.get(key);
      
      if (!data) {
        // Fjernet debug-logging for cache miss for å redusere logging
        return null;
      }
      
      // Fjernet debug-logging for cache hit for å redusere logging
      return JSON.parse(data) as T;
    } else {
      // Bruk minnebasert cache
      const data = getMemoryCacheItem<T>(key);
      return data;
    }
  } catch (error) {
    // Ved feil i Redis, prøv minnebasert cache
    logger.error(`Feil ved henting fra Redis cache: ${key}`, { error: error as Error });
    const data = getMemoryCacheItem<T>(key);
    return data;
  }
};

/**
 * Fjerner et enkelt cache-element
 */
export const invalidateCacheItem = async (key: string): Promise<boolean> => {
  try {
    const redis = getRedisClient();
    
    if (redis) {
      await redis.del(key);
      // Logger kun ved feilsituasjoner
    }
    
    // Alltid fjern fra minnebasert cache også
    deleteMemoryCacheItem(key);
    
    return true;
  } catch (error) {
    logger.error(`Feil ved invalidering av cache: ${key}`, { error: error as Error });
    // Forsøk likevel å fjerne fra minnebasert cache
    deleteMemoryCacheItem(key);
    return true;
  }
};

/**
 * Fjerner alle cache-elementer i en gruppe (f.eks. alle avvik)
 */
export const invalidateCacheGroup = async (group: CacheGroup): Promise<boolean> => {
  try {
    const prefix = `${CACHE_PREFIX}${group}`;
    const redis = getRedisClient();
    
    if (redis) {
      const pattern = `${prefix}*`;
      
      // Finn alle nøkler som matcher mønsteret
      const keys = await redis.keys(pattern);
      
      if (keys.length > 0) {
        // Slett alle matchende nøkler
        await redis.del(...keys);
        logger.info(`Invalidert ${keys.length} Redis cache-elementer for gruppe: ${group}`);
      }
    }
    
    // Alltid fjern fra minnebasert cache også
    deleteMemoryCacheByPrefix(prefix);
    logger.info(`Invalidert minnebasert cache for gruppe: ${group}`);
    
    return true;
  } catch (error) {
    logger.error(`Feil ved invalidering av cache-gruppe: ${group}`, { error: error as Error });
    // Forsøk likevel å fjerne fra minnebasert cache
    const prefix = `${CACHE_PREFIX}${group}`;
    deleteMemoryCacheByPrefix(prefix);
    return true;
  }
};

/**
 * Wrapper-funksjon for å cache API-resultater
 */
export const withCache = async <T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  ttl: number = DEFAULT_TTL
): Promise<T> => {
  // Prøv å hente fra cache først
  const cachedData = await getCacheItem<T>(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }
  
  // Hvis ikke i cache, hent ferske data
  const freshData = await fetchFn();
  
  // Lagre i cache for fremtidige forespørsler
  await setCacheItem(cacheKey, freshData, ttl);
  
  return freshData;
};

/**
 * Wrapper for å få data med automatisk nøkkelgenerering
 */
export const getWithCache = async <T>(
  group: CacheGroup,
  id: string | null = null,
  params: Record<string, any> = {},
  fetchFn: () => Promise<T>,
  ttl: number = DEFAULT_TTL
): Promise<T> => {
  const cacheKey = generateCacheKey(group, id, params);
  return withCache(cacheKey, fetchFn, ttl);
}; 