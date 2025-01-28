import prisma from "@/lib/db"

export async function createNotification({
  title,
  message,
  type,
  userId,
  link
}: {
  title: string
  message: string
  type: string
  userId: string
  link?: string
}) {
  try {
    // Sjekk om vi er på server-side (process.env.NEXT_PUBLIC_APP_URL vil være undefined på klient-side)
    if (typeof window === 'undefined') {
      // Server-side: Bruk Prisma direkte
      const notification = await prisma.notification.create({
        data: {
          title,
          message,
          type,
          userId,
          link
        }
      })
      return notification
    } else {
      // Klient-side: Bruk fetch
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const response = await fetch(`${baseUrl}/api/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          message,
          type,
          userId,
          link
        })
      })

      if (!response.ok) {
        throw new Error('Kunne ikke opprette notifikasjon')
      }

      return response.json()
    }
  } catch (error) {
    console.error('Feil ved opprettelse av notifikasjon:', error)
    // Ikke la notifikasjons-feil stoppe hovedoperasjonen
    return null
  }
}