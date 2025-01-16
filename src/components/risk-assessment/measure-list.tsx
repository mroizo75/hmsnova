'use client'

import { Badge } from "@/components/ui/badge"

interface BaseMeasure {
  id: string
  description: string
  status: string
  type: string
  priority: string
  hazardId?: string
}

interface MeasureListProps {
  measures: BaseMeasure[] | undefined
  type?: 'risk' | 'standard'
}

export function MeasureList({ measures, type = 'standard' }: MeasureListProps) {
  if (!measures || measures.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Ingen tiltak registrert
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {measures.map((measure) => (
        <div key={measure.id} className="p-3 bg-muted rounded-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">
                {type === 'standard' 
                  ? measure.description.split('\n')[0] 
                  : measure.description}
              </p>
              <p className="text-sm text-muted-foreground">
                Type: {measure.type} | Prioritet: {measure.priority}
              </p>
            </div>
            <Badge variant={measure.status === "OPEN" ? "secondary" : "success"}>
              {measure.status}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  )
} 