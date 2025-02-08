"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDate } from "@/lib/utils/date"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { SAFETY_ROUND_STATUSES, getStatusBadgeVariant, SafetyRoundStatus } from "@/lib/constants/safety-round-statuses"

interface RecentRound {
  id: string
  title: string
  company: string
  status: SafetyRoundStatus
  date: Date
}

const recentRounds: RecentRound[] = [
  {
    id: "1",
    title: "Månedlig vernerunde",
    company: "Bedrift AS",
    status: "IN_PROGRESS",
    date: new Date(),
  },
  // ... flere runder
]

export function RecentRounds() {
  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-4">
        {recentRounds.map((round) => (
          <div
            key={round.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="space-y-1">
              <p className="font-medium">{round.title}</p>
              <p className="text-sm text-muted-foreground">{round.company}</p>
              <div className="flex items-center gap-2">
                <Badge variant={getStatusBadgeVariant(round.status) as "default" | "secondary" | "destructive" | "outline"}>
                  {SAFETY_ROUND_STATUSES[round.status]}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {formatDate(round.date)}
                </span>
              </div>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/admin/safety-rounds/${round.id}`}>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
} 