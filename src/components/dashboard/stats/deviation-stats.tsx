"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Clock, TrendingUp } from "lucide-react"
import { Status } from "@prisma/client"

interface DeviationStatsProps {
  stats: Array<{
    status: Status;
    _count: number;
  }>
}

export function DeviationStats({ stats }: DeviationStatsProps) {
  const getCount = (statuses: Status[]) => {
    return stats
      .filter(s => statuses.includes(s.status))
      .reduce((acc, curr) => acc + curr._count, 0)
  }

  const total = stats.reduce((acc, curr) => acc + curr._count, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Avviksstatus</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-sm font-medium">Åpne</p>
              <p className="text-2xl font-bold">{getCount([Status.OPEN, Status.AAPEN])}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Clock className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-sm font-medium">Under arbeid</p>
              <p className="text-2xl font-bold">{getCount([Status.IN_PROGRESS, Status.PAAGAAR])}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm font-medium">Lukket</p>
              <p className="text-2xl font-bold">{getCount([Status.CLOSED, Status.LUKKET])}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <TrendingUp className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm font-medium">Totalt</p>
              <p className="text-2xl font-bold">{total}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 