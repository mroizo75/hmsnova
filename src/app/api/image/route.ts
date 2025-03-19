import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import sharp from 'sharp'
import pino from 'pino'

const logger = pino({
  name: 'image-api',
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
})

// Vanlige MIME-typer for bilder
const MIME_TYPES = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  avif: 'image/avif'
}

// Maksimale og standard verdier for begrensning
const MAX_WIDTH = 2000
const MAX_HEIGHT = 2000
const DEFAULT_QUALITY = 80
const DEFAULT_FORMAT = 'webp'

// Cache for å redusere bildeprosessering
const imageCache = new Map<string, { buffer: Buffer, contentType: string }>()

export async function GET(request: NextRequest) {
  try {
    // Sjekk for autentisering hvis det er nødvendig (kommentert ut for nå)
    // const session = await getServerSession(authOptions)
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    // }

    // Parse URL-parametere
    const { searchParams } = new URL(request.url)
    const encodedUrl = searchParams.get('url')
    
    if (!encodedUrl) {
      return NextResponse.json({ error: "Manglende bilde-URL" }, { status: 400 })
    }
    
    // Dekode URL-en
    const imageUrl = decodeURIComponent(encodedUrl)

    // Parse og valider parametere
    const width = Math.min(
      parseInt(searchParams.get('width') || '0') || 0,
      MAX_WIDTH
    )
    const height = Math.min(
      parseInt(searchParams.get('height') || '0') || 0,
      MAX_HEIGHT
    )
    const quality = Math.min(
      Math.max(parseInt(searchParams.get('quality') || '0') || DEFAULT_QUALITY, 1),
      100
    )
    
    // Sikker håndtering av format-parameter
    const formatParam = searchParams.get('format') || DEFAULT_FORMAT
    let format: keyof typeof MIME_TYPES
    if (formatParam === 'webp' || formatParam === 'jpeg' || 
        formatParam === 'png' || formatParam === 'avif') {
      format = formatParam
    } else {
      format = DEFAULT_FORMAT as keyof typeof MIME_TYPES
    }
    
    // Bygg en cache-nøkkel basert på URL og parametere
    const cacheKey = `${imageUrl}|${width}|${height}|${quality}|${format}`
    
    // Sjekk om bildet allerede er i cachen
    if (imageCache.has(cacheKey)) {
      const cachedImage = imageCache.get(cacheKey)!
      logger.debug({ imageUrl, width, height, format, quality, cacheHit: true }, 'Returnerer cachet bilde')
      
      return new NextResponse(cachedImage.buffer, {
        headers: {
          'Content-Type': cachedImage.contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        }
      })
    }

    // Hent bildet
    logger.debug({ imageUrl }, 'Henter bilde fra URL')
    const imageResponse = await fetch(imageUrl)
    
    if (!imageResponse.ok) {
      logger.error({ imageUrl, status: imageResponse.status }, 'Kunne ikke hente bilde')
      return NextResponse.json(
        { error: "Kunne ikke hente bilde", status: imageResponse.status },
        { status: 502 }
      )
    }

    // Les bildedata som ArrayBuffer
    const imageBuffer = await imageResponse.arrayBuffer()
    
    // Prosesser bildet med sharp
    let sharpInstance = sharp(Buffer.from(imageBuffer))
    
    // Hent metadata om bildet
    const metadata = await sharpInstance.metadata()
    
    // Beregn dimensjoner hvis ikke begge er angitt
    let targetWidth = width
    let targetHeight = height
    
    if (width && !height && metadata.width && metadata.height) {
      // Beregn høyde basert på bredde og behold aspektforhold
      targetHeight = Math.round((metadata.height / metadata.width) * width)
    } else if (height && !width && metadata.width && metadata.height) {
      // Beregn bredde basert på høyde og behold aspektforhold
      targetWidth = Math.round((metadata.width / metadata.height) * height)
    }
    
    // Resize bare hvis dimensjonene er spesifisert
    if (targetWidth || targetHeight) {
      sharpInstance = sharpInstance.resize({
        width: targetWidth || undefined,
        height: targetHeight || undefined,
        fit: 'inside',
        withoutEnlargement: true
      })
    }
    
    // Konverter til angitt format
    let outputBuffer: Buffer
    let contentType: string
    
    switch (format) {
      case 'webp':
        outputBuffer = await sharpInstance.webp({ quality: quality }).toBuffer()
        contentType = MIME_TYPES.webp
        break
      case 'avif':
        outputBuffer = await sharpInstance.avif({ quality: quality }).toBuffer()
        contentType = MIME_TYPES.avif
        break
      case 'png':
        outputBuffer = await sharpInstance.png().toBuffer()
        contentType = MIME_TYPES.png
        break
      case 'jpeg':
      default:
        outputBuffer = await sharpInstance.jpeg({ quality: quality }).toBuffer()
        contentType = MIME_TYPES.jpeg
        break
    }
    
    // Lagre i cache
    imageCache.set(cacheKey, { buffer: outputBuffer, contentType })
    
    // Begrens cache-størrelse (maks 100 elementer)
    if (imageCache.size > 100) {
      const oldestKey = imageCache.keys().next().value
      if (oldestKey) {
        imageCache.delete(oldestKey)
      }
    }
    
    logger.debug({ 
      imageUrl, 
      width: targetWidth, 
      height: targetHeight, 
      format, 
      quality,
      originalSize: imageBuffer.byteLength,
      optimizedSize: outputBuffer.byteLength,
      reduction: `${Math.round((1 - outputBuffer.byteLength / imageBuffer.byteLength) * 100)}%`
    }, 'Bilde optimalisert')
    
    // Returner optimalisert bilde
    return new NextResponse(outputBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      }
    })
  } catch (error) {
    logger.error({ error }, 'Feil ved bildeprosessering')
    return NextResponse.json(
      { error: "Kunne ikke behandle bildet" },
      { status: 500 }
    )
  }
} 