"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils/date"

interface Change {
  id: string
  title: string
  description: string
  status: string
  implementedAt: Date | null
  createdAt: Date
  section: {
    id: string
    title: string
  }
}

interface Props {
  handbookId: string
}

export function PendingChanges({ handbookId }: Props) {
  const [changes, setChanges] = useState<Change[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchChanges() {
      try {
        const response = await fetch(`/api/hms-handbook/${handbookId}/changes`)
        if (!response.ok) throw new Error("Kunne ikke hente endringer")
        const data = await response.json()
        setChanges(data)
      } catch (error) {
        console.error("Error fetching changes:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchChanges()
  }, [handbookId])

  if (isLoading) {
    return <div>Laster endringer...</div>
  }

  if (changes.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        Ingen ventende endringer
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {changes.map((change) => (
        <Card key={change.id} className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">{change.title}</h3>
              <p className="text-sm text-muted-foreground">
                Seksjon: {change.section.title}
              </p>
            </div>
            <Badge variant={change.status === 'OPEN' ? 'default' : 'secondary'}>
              {change.status === 'OPEN' ? 'Aktiv' : change.status}
            </Badge>
          </div>
          
          <p className="mt-2 text-sm">{change.description}</p>

          <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
            <div>
              <span className="font-medium">Opprettet:</span>{" "}
              {formatDate(change.createdAt)}
            </div>
            {change.implementedAt && (
              <div>
                <span className="font-medium">Implementert:</span>{" "}
                {formatDate(change.implementedAt)}
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
} 