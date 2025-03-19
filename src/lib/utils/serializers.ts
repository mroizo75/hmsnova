/**
 * Konverterer alle typer objekter til rene JavaScript-objekter som kan serialiseres
 * mellom server og klient komponenter i Next.js
 */
export function serialize<T>(obj: T): T {
  try {
    // Den enkleste måten å sikre at et objekt er serialiserbart
    return JSON.parse(JSON.stringify(obj));
  } catch (e) {
    // Logg feilen og returner null som fallback
    console.error("Serialiseringsfeil:", e);
    return null as unknown as T;
  }
}

/**
 * Mer avansert rekursiv serialisering som håndterer spesielle tilfeller
 * som Date, Map, Set, osv.
 */
export function toPlainObject<T>(obj: T): any {
  // Null-sjekk
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  // Primitive verdier
  if (typeof obj !== 'object') {
    return obj;
  }
  
  // Date
  if (obj instanceof Date) {
    return obj.toISOString();
  }
  
  // Array
  if (Array.isArray(obj)) {
    return obj.map(item => toPlainObject(item));
  }
  
  // Map
  if (obj instanceof Map) {
    const plainMap: Record<string, any> = {};
    Array.from(obj.entries()).forEach(([key, value]) => {
      plainMap[String(key)] = toPlainObject(value);
    });
    return plainMap;
  }
  
  // Set
  if (obj instanceof Set) {
    return Array.from(obj).map(item => toPlainObject(item));
  }
  
  // toJSON metode (f.eks. Decimal fra Prisma)
  if (typeof (obj as any).toJSON === 'function') {
    return (obj as any).toJSON();
  }
  
  // BigInt
  if (typeof obj === 'bigint') {
    return String(obj);
  }
  
  // RegExp
  if (obj instanceof RegExp) {
    return obj.toString();
  }
  
  // Vanlige objekter
  const plainObj: Record<string, any> = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      try {
        plainObj[key] = toPlainObject((obj as any)[key]);
      } catch (error) {
        console.error(`Kunne ikke konvertere felt '${key}':`, error);
        plainObj[key] = null;
      }
    }
  }
  
  return plainObj;
} 