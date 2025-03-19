import { SJAWithRelations } from "@/app/(dashboard)/dashboard/sja/types";

/**
 * Henter signerte URL-er for vedlegg tilknyttet en SJA
 * @param sja SJA-objektet som inneholder vedlegg
 * @returns Objekt med vedleggID som nøkkel og signert URL som verdi
 */
export async function getSignedAttachmentUrls(sja: SJAWithRelations): Promise<Record<string, string>> {
  try {
    // Sjekk om SJA har vedlegg
    if (!sja.attachments || sja.attachments.length === 0) {
      return {};
    }
    
    // Hent signerte URL-er fra API-endepunktet
    const response = await fetch(`/api/sja/${sja.id}/pdf-attachments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paths: sja.attachments.map(att => att.path)
      }),
    });

    if (!response.ok) {
      throw new Error('Kunne ikke hente signerte vedlegg-URL-er');
    }

    const data = await response.json();
    
    // Returner signerte URL-er
    const signedUrls: Record<string, string> = {};
    
    sja.attachments.forEach((attachment, index) => {
      if (data.signedUrls && data.signedUrls[attachment.path]) {
        signedUrls[attachment.id] = data.signedUrls[attachment.path];
      }
    });
    
    return signedUrls;
  } catch (error) {
    console.error('Feil ved henting av signerte vedlegg-URL-er:', error);
    return {};
  }
} 