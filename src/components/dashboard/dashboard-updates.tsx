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

    const socket = io(`${window.location.protocol}//${window.location.hostname}:3001`, {
      path: '/socket.io',
      transports: ['websocket']
    })

    // Koble til company-spesifikk rom
    socket.emit('join-company', session.user.companyId)

    socket.on('deviation:created', () => {
      // Oppdater dashboard data
      router.refresh()
    })

    socket.on('sja:created', () => {
      // Oppdater dashboard data
      router.refresh()
    })

    socket.on('connect', () => {
      console.log('Tilkoblet Socket.io-server')
    })

    socket.on('connect_error', (error) => {
      console.error('Socket.io tilkoblingsfeil:', error.message)
    })

    return () => {
      socket.disconnect()
    }
  }, [session, router])

  return null
} 