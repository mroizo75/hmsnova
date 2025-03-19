'use client'

import Script from 'next/script'
import { generateBreadcrumbSchema } from '@/lib/schema'

interface BlogArticleSchemaProps {
  title: string
  description: string
  slug: string
  datePublished: string
  dateModified?: string
  authorName: string
  authorUrl?: string
  category?: string
  imageUrl?: string
  tags?: string[]
}

export default function BlogArticleSchema({
  title,
  description,
  slug,
  datePublished,
  dateModified,
  authorName,
  authorUrl,
  category = 'HMS',
  imageUrl,
  tags = []
}: BlogArticleSchemaProps) {
  const url = `https://www.hmsnova.no/blogg/${slug}`
  
  // Bygger breadcrumb-data
  const breadcrumbItems = [
    { name: 'HMS Nova', url: 'https://www.hmsnova.no' },
    { name: 'Blogg', url: 'https://www.hmsnova.no/blogg' },
    { name: title, url }
  ]
  
  // Skaper artikkel-skjema
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    },
    "headline": title,
    "description": description,
    "author": {
      "@type": "Person",
      "name": authorName,
      ...(authorUrl && { "url": authorUrl })
    },
    "publisher": {
      "@type": "Organization",
      "name": "HMS Nova",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.hmsnova.no/HMSNova-logo.svg",
        "width": 600,
        "height": 60
      }
    },
    "datePublished": datePublished,
    "dateModified": dateModified || datePublished,
    ...(imageUrl && {
      "image": {
        "@type": "ImageObject",
        "url": imageUrl,
        "height": 630,
        "width": 1200
      }
    }),
    "articleSection": category,
    "keywords": tags.join(", ")
  }

  return (
    <>
      <Script
        id={`${slug}-breadcrumb-schema`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbSchema(breadcrumbItems))
        }}
      />
      
      <Script
        id={`${slug}-article-schema`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema)
        }}
      />
    </>
  )
} 