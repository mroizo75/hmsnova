interface BrregCompany {
  organisasjonsnummer: string;
  navn: string;
  organisasjonsform: {
    kode: string;
    beskrivelse: string;
  };
  hjemmeside?: string;
  postadresse?: {
    adresse: string[];
    postnummer: string;
    poststed: string;
  };
}

export interface ParsedCompanyData {
  orgNumber: string;
  name: string;
  organizationType: string;
  organizationCode: string;
  website?: string;
  address?: {
    street: string;
    streetNo?: string;
    postalCode: string;
    city: string;
  };
}

export async function validateCompany(orgnr: string): Promise<ParsedCompanyData | null> {
  try {
    const response = await fetch(
      `https://data.brreg.no/enhetsregisteret/api/enheter/${orgnr}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data: BrregCompany = await response.json();
    
    // Parse address if available
    let parsedAddress;
    if (data.postadresse?.adresse?.length && data.postadresse.adresse.length > 0) {
      const addressParts = data.postadresse.adresse[0].split(' ');
      const streetNo = addressParts.pop(); // Get last part as street number
      const street = addressParts.join(' '); // Rest is street name

      parsedAddress = {
        street,
        streetNo,
        postalCode: data.postadresse.postnummer,
        city: data.postadresse.poststed,
      };
    }

    return {
      orgNumber: data.organisasjonsnummer,
      name: data.navn,
      organizationType: data.organisasjonsform.beskrivelse,
      organizationCode: data.organisasjonsform.kode,
      website: data.hjemmeside,
      address: parsedAddress,
    };
  } catch (error) {
    console.error('Error validating company:', error);
    return null;
  }
} 