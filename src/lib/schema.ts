/**
 * Denne filen inneholder strukturerte data-objekter for ulike sider,
 * som forbedrer hvordan innholdet vises i søkeresultater og på sosiale medier.
 * Følger Schema.org standarden: https://schema.org/
 */

export const companySchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "HMS Nova",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "699.00",
    "priceCurrency": "NOK",
    "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
  },
  "description": "HMS Nova er Norges mest brukervennlige og komplette HMS-system for små og mellomstore bedrifter. Forbedre HMS-arbeidet, reduser risiko og oppfyll lovkrav.",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "127"
  }
};

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "HMS Nova AS",
  "url": "https://www.hmsnova.no",
  "logo": "https://www.hmsnova.no/HMSNova-logo.svg",
  "sameAs": [
    "https://www.facebook.com/hmsnova",
    "https://www.linkedin.com/company/hmsnova",
    "https://twitter.com/hmsnova"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+47-XXX-XX-XXX",
    "contactType": "customer service",
    "availableLanguage": ["Norwegian", "English"]
  },
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Oslo",
    "addressRegion": "Oslo",
    "postalCode": "0000",
    "addressCountry": "NO"
  }
};

export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Hva er HMS Nova?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "HMS Nova er et komplett HMS-system utviklet spesielt for små og mellomstore bedrifter i Norge. Systemet inkluderer moduler for avviksbehandling, risikovurdering, stoffkartotek, sikker jobbanalyse (SJA), HMS-håndbok, vernerunder og kompetansestyring."
      }
    },
    {
      "@type": "Question",
      "name": "Hvordan kommer jeg i gang med HMS Nova?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Du kan registrere deg for en 14-dagers gratis prøveperiode på vår nettside. Etter registrering får du umiddelbar tilgang til systemet. Vår innebygde veiviser hjelper deg med å komme i gang, og du kan importere data fra eventuelle eksisterende systemer."
      }
    },
    {
      "@type": "Question",
      "name": "Hvor mye koster HMS Nova?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "HMS Nova tilbyr to prisplaner: Standard til 699 kr per måned (normalpris 899 kr) og Premium til 1099 kr per måned (normalpris 1299 kr). Begge planene inkluderer alle grunnleggende HMS-funksjoner, mens Premium-planen gir tilgang til flere avanserte funksjoner og utvidet support."
      }
    },
    {
      "@type": "Question",
      "name": "Hjelper HMS Nova oss med å oppfylle lovkrav?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ja, HMS Nova er utviklet for å hjelpe bedrifter med å oppfylle kravene i arbeidsmiljøloven og internkontrollforskriften. Systemet inneholder oppdaterte maler, sjekklister og veiledninger som sikrer at ditt HMS-arbeid er i tråd med gjeldende regelverk."
      }
    },
    {
      "@type": "Question",
      "name": "Kan jeg få hjelp til å sette opp systemet?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ja, vi tilbyr onboarding-støtte og opplæring for alle kunder. Premium-kunder får også tilgang til en dedikert kontaktperson og mer omfattende implementeringsstøtte. Vi tilbyr også skreddersydde konsulent- og rådgivningstjenester ved behov."
      }
    }
  ]
};

export const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "HMS Nova Premium",
  "image": "https://www.hmsnova.no/images/hmsnova-premium.jpg",
  "description": "HMS Nova Premium er vår mest omfattende HMS-løsning, som inkluderer alle moduler og funksjoner for komplett HMS-styring i din bedrift.",
  "brand": {
    "@type": "Brand",
    "name": "HMS Nova"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://www.hmsnova.no/register?plan=premium",
    "priceCurrency": "NOK",
    "price": "1099.00",
    "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "84"
  }
};

export const courseSchema = {
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "HMS Grunnkurs (40-timers kurs)",
  "description": "Omfattende HMS-grunnkurs for verneombud og HMS-ansvarlige som dekker alle lovpålagte krav.",
  "provider": {
    "@type": "Organization",
    "name": "HMS Nova AS",
    "sameAs": "https://www.hmsnova.no"
  },
  "courseCode": "HMS-G40",
  "hasCourseInstance": {
    "@type": "CourseInstance",
    "courseMode": "ONLINE",
    "duration": "P5D",
    "startDate": "2023-11-15",
    "endDate": "2023-11-19",
    "inLanguage": "no",
    "location": {
      "@type": "VirtualLocation",
      "url": "https://www.hmsnova.no/kurs/hms-grunnkurs"
    },
    "offers": {
      "@type": "Offer",
      "availability": "https://schema.org/InStock",
      "price": "9800.00",
      "priceCurrency": "NOK"
    }
  }
};

// Hjelpefunksjon for å generere BreadcrumbList skjema
export function generateBreadcrumbSchema(items: {name: string, url: string}[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}

// Hjelpefunksjon for å generere Video skjema
export function generateVideoSchema(
  name: string, 
  description: string, 
  thumbnailUrl: string,
  uploadDate: string,
  contentUrl: string,
  embedUrl?: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": name,
    "description": description,
    "thumbnailUrl": thumbnailUrl,
    "uploadDate": uploadDate,
    "contentUrl": contentUrl,
    ...(embedUrl && { "embedUrl": embedUrl }),
    "potentialAction": {
      "@type": "WatchAction",
      "target": contentUrl
    }
  };
} 