"use client"

import { useEffect } from "react"
import { io } from "socket.io-client"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export function DashboardUpdates() {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!session?.user?.companyId) return

    // Forsøk å koble til socket.io-serveren
    try {
      const socket = io(`${window.location.protocol}//${window.location.hostname}:3001`, {
        path: '/socket.io',
        transports: ['websocket'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      })

      // Koble til company-spesifikk rom
      socket.emit('join-company', session.user.companyId)

      // Håndterer hendelser for avvik, SJA og andre
      socket.on('deviation:created', () => {
        console.log('Nytt avvik registrert, oppdaterer data')
        router.refresh()
      })

      socket.on('sja:created', () => {
        console.log('Ny SJA registrert, oppdaterer data')
        router.refresh()
      })

      // Nye hendelser for moduler og generell oppdatering
      socket.on('modules:updated', () => {
        console.log('Moduler oppdatert, oppdaterer grensesnitt')
        router.refresh()
      })

      socket.on('data:refresh', () => {
        console.log('Mottok global oppdateringsforespørsel')
        router.refresh()
      })

      // Loggføring for tilkobling
      socket.on('connect', () => {
        console.log('Tilkoblet Socket.io-server')
      })

      socket.on('connect_error', (error) => {
        console.error('Socket.io tilkoblingsfeil:', error.message)
      })

      // Koble fra ved komponent-unmount
      return () => {
        socket.disconnect()
      }
    } catch (error) {
      console.error('Feil ved oppsett av socket.io:', error)
    }
  }, [session, router])

  // Usynlig komponent
  return null
} 