import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  // Basisadresse for nettstedet
  const baseUrl = 'https://www.hmsnova.com'
  
  // Dagens dato for lastModified
  const currentDate = new Date().toISOString()
  
  // Hovedsider
  const mainPages = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/forgot-password`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.4,
    },
  ]
  
  // Moduler og tjenester
  const modulePages = [
    {
      url: `${baseUrl}/avvikshandtering`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/risikovurdering`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/hms-handbok`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/stoffkartotek`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/sikkerjobbanalyse`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/vernerunde`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
  ]
  
  // Informasjonssider
  const infoPages = [
    {
      url: `${baseUrl}/omoss`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/karriere`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/team`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/personvern`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.2,
    },
  ]
  
  // Bloggartikler (disse ville vanligvis komme fra en database)
  const blogPages = [
    {
      url: `${baseUrl}/blogg/5-vanlige-feil-i-hms-arbeidet`,
      lastModified: currentDate,
      changeFrequency: 'never' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blogg/nye-krav-til-internkontroll-2023`,
      lastModified: currentDate,
      changeFrequency: 'never' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blogg/hvordan-velge-riktig-hms-system`,
      lastModified: currentDate,
      changeFrequency: 'never' as const,
      priority: 0.7,
    },
  ]
  
  // Kombinere alle sider
  return [...mainPages, ...modulePages, ...infoPages, ...blogPages]
} 