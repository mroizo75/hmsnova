"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { SafetyRoundsList } from "./safety-rounds-list"
import { CreateSafetyRoundDialog } from "./create-safety-round-dialog"
import { useState } from "react"

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

interface SafetyRoundsClientProps {
  safetyRounds: SafetyRound[]
}

export function SafetyRoundsClient({ safetyRounds: initialSafetyRounds }: SafetyRoundsClientProps) {
  const [safetyRounds, setSafetyRounds] = useState(initialSafetyRounds)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Vernerunder</h1>
        <CreateSafetyRoundDialog 
          onSuccess={(newRound) => {
            setSafetyRounds(prev => [newRound, ...prev])
          }}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aktive vernerunder</CardTitle>
        </CardHeader>
        <CardContent>
          <SafetyRoundsList safetyRounds={safetyRounds} />
        </CardContent>
      </Card>
    </div>
  )
} 