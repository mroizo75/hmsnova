"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { AddGoalDialog } from "./add-goal-dialog"
import { GoalStatus } from "@prisma/client"

interface HMSGoal {
  id: string
  description: string
  year: number
  status: GoalStatus
}

interface Props {
  initialGoals: HMSGoal[]
}

export function HMSGoalsClient({ initialGoals }: Props) {
  const [goals, setGoals] = useState(initialGoals)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const currentYear = new Date().getFullYear()
  const nextYear = currentYear + 1

  const handleAddGoal = async (goal: { description: string; year: number }) => {
    try {
      const response = await fetch('/api/hms-goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goal)
      })

      if (!response.ok) throw new Error('Failed to add goal')

      const newGoal = await response.json()
      setGoals(prev => [...prev, newGoal])
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error('Error adding goal:', error)
    }
  }

  const handleUpdateStatus = async (goalId: string, status: GoalStatus) => {
    try {
      const response = await fetch(`/api/hms-goals/${goalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (!response.ok) throw new Error('Failed to update goal')

      setGoals(prev => 
        prev.map(goal => 
          goal.id === goalId ? { ...goal, status } : goal
        )
      )
    } catch (error) {
      console.error('Error updating goal:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">HMS-mål</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Legg til mål
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {[currentYear, nextYear].map(year => (
          <Card key={year} className="p-6">
            <h2 className="text-xl font-semibold mb-4">{year}</h2>
            <div className="space-y-4">
              {goals
                .filter(goal => goal.year === year)
                .map(goal => (
                  <div
                    key={goal.id}
                    className="flex items-start justify-between gap-4 p-4 rounded-lg border"
                  >
                    <div>
                      <p>{goal.description}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Status: {goal.status}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {goal.status !== 'ACHIEVED' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateStatus(goal.id, 'ACHIEVED')}
                        >
                          Marker som oppnådd
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        ))}
      </div>

      <AddGoalDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddGoal}
      />
    </div>
  )
} 