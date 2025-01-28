"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AddMeasureDialog } from "./add-measure-dialog"
import { useState } from "react"
import { formatDate } from "@/lib/utils/date"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp } from "lucide-react"
import { MeasureList } from "./measure-list"

interface Measure {
  id: string
  description: string
  type: string
  status: string
  priority: string
  dueDate: Date | null
  completedAt: Date | null
  assignedTo: string | null
}

interface RiskAssessmentMeasure {
  id: string
  description: string
  type: string
  status: string
  priority: string
  hazardId: string
}

interface HazardCardProps {
  assessmentId: string
  hazard: {
    id: string
    description: string
    consequence: string
    probability: number
    severity: number
    riskLevel: number
    existingMeasures: string | null
    riskMeasures: RiskAssessmentMeasure[]
  }
}

export function HazardCard({ assessmentId, hazard }: HazardCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const getRiskColor = (riskLevel: number) => {
    if (riskLevel > 15) return "destructive"
    if (riskLevel > 8) return "warning"
    return "outline"
  }

  return (
    <Card className="p-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {isOpen ? <ChevronUp /> : <ChevronDown />}
                </Button>
              </CollapsibleTrigger>
              <h3 className="font-medium">{hazard.description}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{hazard.consequence}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              Risikonivå: {hazard.riskLevel}
            </Badge>
            <Badge variant="secondary">
              S: {hazard.severity} | W: {hazard.probability}
            </Badge>
          </div>
        </div>

        <CollapsibleContent className="mt-4 space-y-4">
          {hazard.existingMeasures && (
            <div>
              <h4 className="text-sm font-medium mb-1">Eksisterende tiltak</h4>
              <p className="text-sm text-muted-foreground">
                {hazard.existingMeasures}
              </p>
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium">Nye tiltak</h4>
              <AddMeasureDialog
                assessmentId={assessmentId}
                hazardId={hazard.id}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
              />
            </div>
            <MeasureList 
              assessmentId={assessmentId}
              hazardId={hazard.id}
              measures={hazard.riskMeasures}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
} 