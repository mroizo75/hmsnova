/**
 * Grensesnitt for bildeoptimaliseringsalternativer
 */
interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'avif';
}

/**
 * Optimaliserer en bildekilde-URL ved å legge til parametre for optimalisering
 * Dette fungerer med de fleste moderne bildeoptimaliseringstjenester og Next.js Image
 * 
 * @param url Original bilde-URL
 * @param options Optimaliseringsalternativene
 * @returns Optimalisert bilde-URL
 */
export function optimizeImageUrl(url: string, options: ImageOptimizationOptions = {}): string {
  if (!url) return url;

  // Sjekk om URL-en allerede er optimalisert eller er en data-URL (base64)
  if (url.startsWith('data:') || url.includes('?width=') || url.includes('&quality=')) {
    return url;
  }

  try {
    // Avgjør om vi bruker Next.js Image API eller en annen optimaliseringstjeneste
    if (process.env.NEXT_PUBLIC_USE_IMAGE_OPTIMIZATION === 'true') {
      const baseUrl = '/api/image';
      const params = new URLSearchParams();
      params.append('url', encodeURIComponent(url));
      
      if (options.width) params.append('width', options.width.toString());
      if (options.height) params.append('height', options.height.toString());
      if (options.quality) params.append('quality', options.quality.toString());
      if (options.format) params.append('format', options.format);
      
      return `${baseUrl}?${params.toString()}`;
    } else {
      // Fallback - returner original URL for miljøer uten bildeoptimalisering
      return url;
    }
  } catch (error) {
    console.error('Feil ved optimalisering av bilde-URL:', error);
    return url; // Returner original URL ved feil
  }
}

/**
 * Lazy-loading hook for bilder
 * Dette brukes for å laste inn bilder bare når de er i viewporten
 */
export function createLazyImageLoader() {
  // Bildekolonnens cache
  const imageCache = new Map<string, string>();

  // Sjekk om IntersectionObserver er tilgjengelig (kun i nettleseren)
  const isClient = typeof window !== 'undefined';
  const hasIntersectionObserver = isClient && 'IntersectionObserver' in window;

  return {
    /**
     * Laster et bilde og mellomlagrer resultatet
     */
    loadImage: async (url: string): Promise<string> => {
      // Sjekk cache først
      if (imageCache.has(url)) {
        return imageCache.get(url)!;
      }
      
      try {
        // I server-miljø, returner bare URL-en
        if (!isClient) return url;
        
        // I klient-miljø, last og cache bildet
        const response = await fetch(url);
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        
        // Legg til i cache
        imageCache.set(url, objectUrl);
        return objectUrl;
      } catch (error) {
        console.error('Feil ved lasting av bilde:', error);
        return url;
      }
    },
    
    /**
     * Rydder opp i cache for å forhindre minnelekkasjer
     */
    clearCache: () => {
      // Revoke alle object URLs for å unngå minnelekkasjer
      if (isClient) {
        imageCache.forEach(objectUrl => {
          if (objectUrl.startsWith('blob:')) {
            URL.revokeObjectURL(objectUrl);
          }
        });
      }
      imageCache.clear();
    }
  };
} 