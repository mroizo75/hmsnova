import { SJAWithRelations } from "@/app/(dashboard)/dashboard/sja/types";

/**
 * Henter signerte URL-er for bilder tilknyttet en SJA
 * @param sja SJA-objektet som inneholder bilder
 * @returns Objekt med bildeID som nøkkel og signert URL som verdi
 */
export async function getSignedImageUrls(sja: SJAWithRelations): Promise<Record<string, string>> {
  try {
    const response = await fetch(`/api/sja/${sja.id}/pdf-images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Kunne ikke hente signerte bilde-URL-er');
    }

    const data = await response.json();
    return data.signedUrls || {};
  } catch (error) {
    console.error('Feil ved henting av signerte bilde-URL-er:', error);
    return {};
  }
} 