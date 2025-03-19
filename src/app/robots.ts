import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/dashboard/',
        '/admin/',
        '/employee-dashboard/',
        '/employee/',
        '/profile/',
        '/settings/',
        '/login',
      ],
    },
    sitemap: 'https://www.hmsnova.no/sitemap.xml',
    host: 'https://www.hmsnova.no',
  }
} 