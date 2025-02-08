"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CreateSafetyRoundDialog } from "./create-safety-round-dialog"
import { SafetyRoundList } from "./safety-round-list"
import type { SafetyRound, SafetyRoundTemplate, User } from "@prisma/client"

interface Props {
  initialSafetyRounds: SafetyRound[]
  templates: SafetyRoundTemplate[]
  employees: Pick<User, "id" | "name" | "email" | "role">[]
}

export function SafetyRoundsClient({ 
  initialSafetyRounds,
  templates,
  employees 
}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [safetyRounds, setSafetyRounds] = useState(initialSafetyRounds)

  const activeRounds = safetyRounds.filter(
    round => !['COMPLETED', 'CANCELLED'].includes(round.status)
  )

  const completedRounds = safetyRounds.filter(
    round => round.status === 'COMPLETED'
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vernerunder</h1>
          <p className="text-muted-foreground">
            Planlegg og følg opp vernerunder
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Ny vernerunde
        </Button>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            Aktive ({activeRounds.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Fullførte ({completedRounds.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <SafetyRoundList 
            rounds={activeRounds}
            onUpdate={(updatedRound) => {
              setSafetyRounds(prev => 
                prev.map(r => r.id === updatedRound.id ? updatedRound : r)
              )
            }}
          />
        </TabsContent>

        <TabsContent value="completed">
          <SafetyRoundList 
            rounds={completedRounds}
            onUpdate={(updatedRound) => {
              setSafetyRounds(prev => 
                prev.map(r => r.id === updatedRound.id ? updatedRound : r)
              )
            }}
          />
        </TabsContent>
      </Tabs>

      <CreateSafetyRoundDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        templates={templates}
        employees={employees}
        onCreated={(newRound) => {
          setSafetyRounds(prev => [newRound, ...prev])
          setDialogOpen(false)
        }}
      />
    </div>
  )
} 