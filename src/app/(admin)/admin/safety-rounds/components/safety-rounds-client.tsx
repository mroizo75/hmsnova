"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { SafetyRoundCard } from "./safety-round-card"
import { CreateRoundDialog } from "./create-round-dialog"

interface SafetyRoundsClientProps {
  safetyRounds: any[] // TODO: Legg til riktig type
}

export function SafetyRoundsClient({ safetyRounds: initialRounds }: SafetyRoundsClientProps) {
  const [rounds, setRounds] = useState(initialRounds)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const handleRoundCreated = (newRound: any) => {
    setRounds(prev => [newRound, ...prev])
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vernerunder</h1>
          <p className="text-muted-foreground">
            Administrer vernerunder på tvers av bedrifter
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Ny vernerunde
        </Button>
      </div>

      <div className="grid gap-4">
        {rounds.map(round => (
          <SafetyRoundCard 
            key={round.id} 
            round={round}
            onUpdate={(updatedRound) => {
              setRounds(prev => 
                prev.map(r => 
                  r.id === updatedRound.id ? updatedRound : r
                )
              )
            }}
          />
        ))}
      </div>

      <CreateRoundDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleRoundCreated}
      />
    </div>
  )
} 