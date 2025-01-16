"use client"

import { formatDate } from "@/lib/utils/date"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronRight, AlertCircle, CheckCircle, Clock } from "lucide-react"
import Link from "next/link"

interface SafetyRound {
  id: string
  title: string
  description: string | null
  status: string
  dueDate: Date | null
  completedAt: Date | null
  findings: Array<{
    id: string
    description: string
    severity: string
    status: string
  }>
}

interface SafetyRoundsListProps {
  safetyRounds: SafetyRound[]
}

export function SafetyRoundsList({ safetyRounds }: SafetyRoundsListProps) {
  function getStatusBadge(status: string) {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="success">Fullført</Badge>
      case 'IN_PROGRESS':
        return <Badge variant="warning">Pågår</Badge>
      case 'DRAFT':
        return <Badge variant="secondary">Utkast</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'IN_PROGRESS':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'DRAFT':
        return <AlertCircle className="h-5 w-5 text-gray-500" />
      default:
        return null
    }
  }

  if (safetyRounds.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        Ingen vernerunder er opprettet ennå
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {safetyRounds.map((round) => (
        <div
          key={round.id}
          className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-center gap-4">
            {getStatusIcon(round.status)}
            <div>
              <div className="font-medium">{round.title}</div>
              {round.description && (
                <div className="text-sm text-muted-foreground">
                  {round.description}
                </div>
              )}
              <div className="flex gap-2 mt-1">
                {getStatusBadge(round.status)}
                {round.dueDate && (
                  <Badge variant="outline">
                    Frist: {formatDate(round.dueDate)}
                  </Badge>
                )}
                <Badge variant="outline">
                  {round.findings.length} funn
                </Badge>
              </div>
            </div>
          </div>
          <Link href={`/dashboard/safety-rounds/${round.id}`}>
            <Button variant="ghost" size="icon">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      ))}
    </div>
  )
} 