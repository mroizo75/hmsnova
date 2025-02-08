import { NextRequest } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      console.log('No session found')
      return new Response('Unauthorized', { status: 401 })
    }

    const path = params.path.join('/')
    const decodedPath = decodeURIComponent(path)
    
    // Bruk direkte public URL
    const publicUrl = `https://storage.googleapis.com/innutio-hms/${decodedPath}`
    console.log('DEBUG: Public URL:', publicUrl)

    try {
      // Hent bildet via fetch
      const response = await fetch(publicUrl)
      if (!response.ok) {
        console.error('DEBUG: Fetch error:', response.status, response.statusText)
        return new Response('Image not found', { status: 404 })
      }

      const blob = await response.blob()
      return new Response(blob, {
        headers: {
          'Content-Type': blob.type || 'image/jpeg',
          'Cache-Control': 'public, max-age=31536000',
        },
      })

    } catch (fetchError) {
      console.error('DEBUG: Fetch error:', fetchError)
      return new Response(`Fetch error: ${fetchError}`, { status: 500 })
    }
  } catch (error) {
    console.error('DEBUG: Main error:', error)
    return new Response(`Main error: ${error}`, { status: 500 })
  }
}

export const dynamic = 'force-dynamic' 