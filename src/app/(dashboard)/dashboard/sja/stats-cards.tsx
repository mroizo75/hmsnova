import { Card } from "@/components/ui/card"
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react"

interface StatsCardsProps {
  totalSJA: number
  openSJA: number
  inProgressSJA: number
  completedSJA: number
}

export function StatsCards({ totalSJA, openSJA, inProgressSJA, completedSJA }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <div className="text-sm font-medium">Totalt</div>
        </div>
        <div className="text-2xl font-bold">{totalSJA}</div>
      </Card>
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-500" />
          <div className="text-sm font-medium">Utkast</div>
        </div>
        <div className="text-2xl font-bold">{openSJA}</div>
      </Card>
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-orange-500" />
          <div className="text-sm font-medium">Til godkjenning</div>
        </div>
        <div className="text-2xl font-bold">{inProgressSJA}</div>
      </Card>
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <div className="text-sm font-medium">Godkjent</div>
        </div>
        <div className="text-2xl font-bold">{completedSJA}</div>
      </Card>
    </div>
  )
} 