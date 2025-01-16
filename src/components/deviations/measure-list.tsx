'use client'

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { nb } from "date-fns/locale"
import { CloseMeasureModal } from "./close-measure-modal"

interface Measure {
  id: string
  description: string
  type: string
  status: string
  priority: string
  dueDate?: string | null
  closedAt?: string | null
  closedBy?: string | null
  closeComment?: string | null
  closureVerifiedBy?: string | null
}

interface MeasureListProps {
  measures: Measure[]
  deviationId: string
  onMeasureUpdated?: () => void
}

export function MeasureList({ measures, deviationId, onMeasureUpdated }: MeasureListProps) {
  const [selectedMeasure, setSelectedMeasure] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      {measures.map((measure) => (
        <Card key={measure.id} className="p-4">
          <div className="flex flex-col space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="font-medium">{measure.description}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge>{measure.type}</Badge>
                  <Badge variant={measure.status === "OPEN" ? "default" : "secondary"}>
                    {measure.status}
                  </Badge>
                  <Badge variant={
                    measure.priority === "HIGH" || measure.priority === "CRITICAL" 
                      ? "destructive" 
                      : "outline"
                  }>
                    {measure.priority}
                  </Badge>
                </div>
              </div>
              {measure.status === "OPEN" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log('Setting selected measure:', measure.id)
                    setSelectedMeasure(measure.id)
                  }}
                >
                  Lukk tiltak
                </Button>
              )}
            </div>

            {measure.dueDate && (
              <p className="text-sm text-muted-foreground">
                Frist: {format(new Date(measure.dueDate), "PPP", { locale: nb })}
              </p>
            )}

            {measure.closedAt && (
              <div className="space-y-2 pt-2 border-t">
                <p className="text-sm">
                  <span className="font-medium">Lukket:</span>{" "}
                  {format(new Date(measure.closedAt), "PPP", { locale: nb })}
                </p>
                {measure.closeComment && (
                  <p className="text-sm">
                    <span className="font-medium">Begrunnelse:</span>{" "}
                    {measure.closeComment}
                  </p>
                )}
                {measure.closureVerifiedBy && (
                  <p className="text-sm">
                    <span className="font-medium">Verifisert av:</span>{" "}
                    {measure.closureVerifiedBy}
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>
      ))}

      {selectedMeasure && (
        <CloseMeasureModal
          isOpen={true}
          onClose={() => {
            console.log('Closing modal')
            setSelectedMeasure(null)
          }}
          measureId={selectedMeasure}
          deviationId={deviationId}
          onSuccess={() => {
            console.log('Measure updated')
            onMeasureUpdated?.()
            setSelectedMeasure(null)
          }}
        />
      )}
    </div>
  )
} 