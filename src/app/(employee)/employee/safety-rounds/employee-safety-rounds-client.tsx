"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { SafetyRound } from "@prisma/client"
import { SafetyRoundList } from "./safety-round-list"

interface Props {
  initialSafetyRounds: SafetyRound[]
  userId: string
}

export function EmployeeSafetyRoundsClient({ initialSafetyRounds, userId }: Props) {
  const [safetyRounds, setSafetyRounds] = useState(initialSafetyRounds)

  const activeRounds = safetyRounds.filter(
    round => !['COMPLETED', 'CANCELLED'].includes(round.status)
  )

  const completedRounds = safetyRounds.filter(
    round => round.status === 'COMPLETED'
  )

  return (
    <div className="space-y-4">
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">
            Aktive ({activeRounds.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Fullførte ({completedRounds.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <SafetyRoundList rounds={activeRounds as any} userId={userId} />
        </TabsContent>

        <TabsContent value="completed">
          <SafetyRoundList rounds={completedRounds as any} userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  )
} 