import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSignedUrl } from '@/lib/storage'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
    }

    const { paths } = await request.json()
    
    const signedUrls = await Promise.all(
      paths.map(async (path: string) => {
        try {
          const signedUrl = await getSignedUrl(path)
          return { path, signedUrl }
        } catch (error) {
          console.error(`Kunne ikke generere signert URL for ${path}:`, error)
          return { path, error: 'Kunne ikke generere signert URL' }
        }
      })
    )

    return NextResponse.json({ urls: signedUrls })
  } catch (error) {
    console.error('Feil ved generering av signerte URLer:', error)
    return NextResponse.json({ error: "Serverfeil" }, { status: 500 })
  }
} 