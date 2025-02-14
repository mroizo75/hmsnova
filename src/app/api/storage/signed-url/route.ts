import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSignedUrl } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const { paths } = await request.json()
    
    if (!Array.isArray(paths)) {
      return NextResponse.json({ error: "Ugyldig forespørsel" }, { status: 400 })
    }

    const signedUrls = await Promise.allSettled(
      paths.map(async (path) => {
        try {
          const signedUrl = await getSignedUrl(path)
          return {
            originalPath: path,
            signedUrl
          }
        } catch (error) {
          console.warn(`Kunne ikke generere signert URL for ${path}:`, error)
          return {
            originalPath: path,
            signedUrl: null
          }
        }
      })
    )

    const validUrls = signedUrls
      .filter((result): result is PromiseFulfilledResult<{originalPath: string, signedUrl: string | null}> => 
        result.status === 'fulfilled')
      .map(result => result.value)
      .filter(item => item.signedUrl !== null)

    return NextResponse.json({ urls: validUrls })
  } catch (error) {
    console.error('Feil ved generering av signerte URLer:', error)
    return NextResponse.json({ error: "Serverfeil" }, { status: 500 })
  }
} 