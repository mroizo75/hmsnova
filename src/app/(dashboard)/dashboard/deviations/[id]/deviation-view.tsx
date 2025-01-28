'use client'

import { DeviationDetails } from "./deviation-details"
import { MeasureList } from "@/components/deviations/measure-list"

interface DeviationViewProps {
  deviation: any
  id: string
  onUpdate: () => Promise<void>
}

export function DeviationView({ deviation, id, onUpdate }: DeviationViewProps) {
  return (
    <div>
      <DeviationDetails 
        deviation={deviation}
        onUpdate={onUpdate}
      />
      
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-4">Tiltak</h2>
        <MeasureList 
          measures={deviation.measures} 
          deviationId={id}
          onMeasureUpdated={onUpdate}
        />
      </div>
    </div>
  )
} 