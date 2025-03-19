/**
 * Hjelpefunksjon for å legge til timeout på asynkrone operasjoner
 * Dette sikrer at langvarige operasjoner avsluttes etter en bestemt tid
 */

/**
 * Kjører en Promise med timeout
 * 
 * @param promise Promise som skal kjøres
 * @param timeoutMs Timeout i millisekunder
 * @param errorMessage Feilmelding som skal returneres ved timeout
 * @returns Resultatet av Promise eller kaster en feil ved timeout
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 10000,
  errorMessage: string = 'Operasjonen tok for lang tid'
): Promise<T> {
  let timeoutId: NodeJS.Timeout | undefined;
  
  // Opprett en timeout promise som vil bli rejected etter angitt tid
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Timeout etter ${timeoutMs}ms: ${errorMessage}`));
    }, timeoutMs);
  });

  // Kjør begge promises samtidig og returner resultatet fra den som blir resolved først
  try {
    const result = await Promise.race([promise, timeoutPromise]);
    if (timeoutId) clearTimeout(timeoutId);
    return result as T;
  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Kjører en Promise med flere forsøk (retry) hvis den feiler
 * 
 * @param fn Funksjon som returnerer en Promise
 * @param retries Antall forsøk
 * @param delayMs Forsinkelse mellom forsøk i millisekunder
 * @returns Resultatet av Promise eller kaster siste feil
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delayMs: number = 500
): Promise<T> {
  let lastError: Error = new Error('Ukjent feil');

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error 
        ? error
        : new Error(String(error));
      
      // Vent før neste forsøk hvis dette ikke er siste forsøk
      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError;
}

/**
 * Kombinerer timeout og retry
 * 
 * @param fn Funksjon som returnerer en Promise
 * @param options Konfigurasjon for timeout og retry
 * @returns Resultatet av Promise eller kaster en feil
 */
export async function withTimeoutAndRetry<T>(
  fn: () => Promise<T>,
  options: {
    timeoutMs?: number;
    retries?: number;
    delayMs?: number;
    errorMessage?: string;
  } = {}
): Promise<T> {
  const { 
    timeoutMs = 10000, 
    retries = 3, 
    delayMs = 500,
    errorMessage = 'Operasjonen tok for lang tid'
  } = options;

  return withRetry(
    () => withTimeout(fn(), timeoutMs, errorMessage),
    retries,
    delayMs
  );
} 