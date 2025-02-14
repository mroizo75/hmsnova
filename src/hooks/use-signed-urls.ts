import { useState, useEffect } from 'react'

interface SignedUrlResponse {
  originalPath: string
  signedUrl: string
}

export function useSignedUrls(paths: string[]) {
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSignedUrls = async () => {
      if (!paths.length) {
        setSignedUrls({})
        setLoading(false)
        return
      }

      try {
        const response = await fetch('/api/storage/signed-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paths: paths.filter(Boolean) })
        })

        if (!response.ok) {
          throw new Error('Kunne ikke hente signerte URLer')
        }

        const data = await response.json()
        if (data.error) {
          throw new Error(data.error)
        }

        const urlMap: Record<string, string> = {}
        data.urls.forEach((item: SignedUrlResponse) => {
          if (item.signedUrl) {
            urlMap[item.originalPath] = item.signedUrl
          }
        })

        setSignedUrls(urlMap)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ukjent feil')
        console.error('Feil ved henting av signerte URLer:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSignedUrls()
  }, [paths.join(',')])

  return { signedUrls, loading, error }
} 