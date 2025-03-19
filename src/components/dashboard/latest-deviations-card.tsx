"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { nb } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { statusLabels, severityColors } from "@/lib/constants/deviations"
import { io } from "socket.io-client"
import Link from "next/link"

interface Deviation {
  id: string
  title: string
  severity: string
  status: string
  createdAt: string
  reportedBy: {
    name: string | null
    email: string
  }
}

export function LatestDeviationsCard() {
  const [deviations, setDeviations] = useState<Deviation[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLatestDeviations = async () => {
    try {
      const response = await fetch("/api/deviations/latest")
      if (!response.ok) throw new Error("Kunne ikke hente avvik")
      const data = await response.json()
      setDeviations(data)
    } catch (error) {
      console.error("Error fetching deviations:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLatestDeviations()

    // WebSocket setup
    const socket = io(`${window.location.protocol}//${window.location.hostname}:3001`, {
      path: '/socket.io',
      transports: ['websocket']
    })

    socket.on('deviation:created', (newDeviation: Deviation) => {
      setDeviations(prev => [newDeviation, ...prev.slice(0, 4)])
    })

    socket.on('connect', () => {
      console.log('LatestDeviationsCard: Tilkoblet Socket.io-server')
    })

    socket.on('connect_error', (error) => {
      console.error('LatestDeviationsCard: Socket.io tilkoblingsfeil:', error.message)
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  if (loading) {
    return <Card><CardContent>Laster...</CardContent></Card>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Siste avvik</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {deviations.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Ingen avvik registrert
            </p>
          ) : (
            deviations.map((deviation) => (
              <Link 
                key={deviation.id}
                href={`/dashboard/deviations/${deviation.id}`}
                className="block hover:bg-muted/50 p-2 rounded-lg transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{deviation.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Rapportert av {deviation.reportedBy.name || deviation.reportedBy.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(deviation.createdAt), {
                        addSuffix: true,
                        locale: nb
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={severityColors[deviation.severity]}>
                      {deviation.severity}
                    </Badge>
                    <Badge variant="outline">
                      {statusLabels[deviation.status]}
                    </Badge>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
} 