import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  try {
    // Basisadresse for nettstedet
    const baseUrl = 'https://www.hmsnova.no'
    
    // Dagens dato for lastModified
    const today = new Date().toISOString().split('T')[0]
    
    // Starter XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`
    
    // Hovedsider (statiske)
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'weekly' },
      { url: '/login', priority: '0.7', changefreq: 'monthly' },
      { url: '/register', priority: '0.8', changefreq: 'monthly' },
      { url: '/forgot-password', priority: '0.5', changefreq: 'yearly' },
      { url: '/avvikshandtering', priority: '0.9', changefreq: 'monthly' },
      { url: '/risikovurdering', priority: '0.9', changefreq: 'monthly' },
      { url: '/hms-handbok', priority: '0.9', changefreq: 'monthly' },
      { url: '/stoffkartotek', priority: '0.9', changefreq: 'monthly' },
      { url: '/sikkerjobbanalyse', priority: '0.9', changefreq: 'monthly' },
      { url: '/vernerunde', priority: '0.9', changefreq: 'monthly' },
      { url: '/omoss', priority: '0.8', changefreq: 'monthly' },
      { url: '/team', priority: '0.8', changefreq: 'monthly' },
      { url: '/karriere', priority: '0.7', changefreq: 'weekly' },
      { url: '/personvern', priority: '0.5', changefreq: 'yearly' },
      { url: '/cookies', priority: '0.5', changefreq: 'yearly' },
      { url: '/terms', priority: '0.5', changefreq: 'yearly' },
    ]
    
    // Legger til statiske sider
    staticPages.forEach((page) => {
      xml += `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`
    })
    
    // Henter bloggartikler fra databasen (hvis dette eksisterer i din app)
    try {
      const blogPosts = await prisma.blogPost.findMany({
        select: {
          slug: true,
          updatedAt: true,
        },
        where: {
          published: true
        },
        orderBy: {
          updatedAt: 'desc'
        }
      })
      
      // Legger til bloggartikler
      for (const post of blogPosts) {
        const lastmod = post.updatedAt.toISOString().split('T')[0]
        
        xml += `  <url>
    <loc>${baseUrl}/blogg/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`
      }
    } catch (error) {
      console.log('Ingen bloggartikler funnet eller tabell eksisterer ikke')
    }
    
    // Avslutter XML
    xml += `</urlset>`
    
    // Returner sitemap som XML
    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    })
  } catch (error) {
    console.error('Feil ved generering av sitemap:', error)
    return new NextResponse('Feil ved generering av sitemap', { status: 500 })
  }
} 