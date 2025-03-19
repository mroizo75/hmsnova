'use client'

import Script from 'next/script'
import { generateBreadcrumbSchema } from '@/lib/schema'

interface ModuleSEOProps {
  title: string
  description: string
  moduleName: string
  moduleSlug: string
  features: string[]
  videoUrl?: string
  videoThumbnail?: string
}

export default function ModuleSEO({
  title,
  description,
  moduleName,
  moduleSlug,
  features,
  videoUrl,
  videoThumbnail
}: ModuleSEOProps) {
  // Bygger breadcrumb-data
  const breadcrumbItems = [
    { name: 'HMS Nova', url: 'https://www.hmsnova.no' },
    { name: 'Tjenester', url: 'https://www.hmsnova.no/#tjenester' },
    { name: moduleName, url: `https://www.hmsnova.no/${moduleSlug}` }
  ]
  
  // Skaper strukturerte data for denne modulen
  const moduleSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": `HMS Nova - ${moduleName}`,
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "applicationSubCategory": "HMS Software",
    "offers": {
      "@type": "Offer",
      "price": "699.00",
      "priceCurrency": "NOK"
    },
    "description": description,
    "featureList": features.join(", ")
  }
  
  // Legger til video-skjema hvis video er gitt
  const videoSchema = videoUrl && videoThumbnail ? {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": `${moduleName} - HMS Nova`,
    "description": description,
    "thumbnailUrl": videoThumbnail,
    "uploadDate": "2023-01-01T08:00:00+08:00",
    "contentUrl": videoUrl,
    "embedUrl": videoUrl
  } : null

  return (
    <>
      <Script
        id={`${moduleSlug}-breadcrumb-schema`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbSchema(breadcrumbItems))
        }}
      />
      
      <Script
        id={`${moduleSlug}-module-schema`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(moduleSchema)
        }}
      />
      
      {videoSchema && (
        <Script
          id={`${moduleSlug}-video-schema`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(videoSchema)
          }}
        />
      )}
    </>
  )
} 