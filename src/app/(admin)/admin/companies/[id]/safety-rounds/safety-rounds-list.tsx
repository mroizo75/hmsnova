"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Calendar, ChevronRight } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils/date"

interface SafetyRound {
  id: string
  title: string
  description?: string
  status: string
  scheduledDate?: string
  dueDate?: string
  createdAt: string
  assignedTo?: string
}

interface SafetyRoundsListProps {
  companyId: string
}

export function SafetyRoundsList({ companyId }: SafetyRoundsListProps) {
  const [rounds, setRounds] = useState<SafetyRound[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRounds() {
      try {
        const response = await fetch(`/api/admin/companies/${companyId}/safety-rounds?status=active`)
        if (!response.ok) throw new Error('Kunne ikke hente vernerunder')
        const data = await response.json()
        setRounds(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Noe gikk galt')
      } finally {
        setLoading(false)
      }
    }

    fetchRounds()
  }, [companyId])

  if (loading) {
    return <div className="text-center py-6">Laster vernerunder...</div>
  }

  if (error) {
    return <div className="text-center py-6 text-red-500">{error}</div>
  }

  if (rounds.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        Ingen aktive vernerunder
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {rounds.map((round) => (
        <Link key={round.id} href={`/admin/companies/${companyId}/safety-rounds/${round.id}`}>
          <Card className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{round.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {round.description || 'Ingen beskrivelse'}
                </p>
                {round.scheduledDate && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Planlagt: {formatDate(round.scheduledDate)}
                  </p>
                )}
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
} 