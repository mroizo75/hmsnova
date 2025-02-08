"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronRight, Clock } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils/date"
import type { SafetyRound, SafetyRoundStatus } from "@prisma/client"

interface Props {
  rounds: (SafetyRound & {
    template: {
      name: string
    } | null
    assignedUser: {
      id: string
      name: string | null
      email: string
    } | null
    participants: Array<{
      user: {
        id: string
        name: string | null
        email: string
      }
    }>
    findings: Array<{
      id: string
      severity: string
      status: string
      images: Array<{
        id: string
        url: string
      }>
    }>
  })[]
  userId: string
}

const statusLabels: Record<SafetyRoundStatus, string> = {
  DRAFT: 'Utkast',
  SCHEDULED: 'Planlagt',
  IN_PROGRESS: 'Pågår',
  COMPLETED: 'Fullført',
  CANCELLED: 'Kansellert'
}

const statusColors: Record<SafetyRoundStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SCHEDULED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800'
}

export function SafetyRoundList({ rounds, userId }: Props) {
  if (rounds.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            Ingen vernerunder å vise
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {rounds.map((round) => {
        const isOverdue = round.dueDate && new Date(round.dueDate) < new Date()
        const isResponsible = round.assignedTo === userId
        const totalFindings = round.findings.length

        return (
          <Card key={round.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{round.title}</h3>
                    <Badge className={statusColors[round.status as SafetyRoundStatus]}>
                      {statusLabels[round.status as SafetyRoundStatus]}
                    </Badge>
                    {isResponsible && (
                      <Badge variant="outline">Ansvarlig</Badge>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {round.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm">
                    {round.scheduledDate && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDate(round.scheduledDate)}
                      </span>
                    )}
                    {isOverdue && (
                      <Badge variant="destructive">Forfalt</Badge>
                    )}
                  </div>

                  {totalFindings > 0 && (
                    <div className="mt-2">
                      <Badge variant="secondary">
                        {totalFindings} {totalFindings === 1 ? 'funn' : 'funn'}
                      </Badge>
                    </div>
                  )}
                </div>

                <Link href={`/employee/safety-rounds/${round.id}`}>
                  <Button variant="ghost" size="icon">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
} 