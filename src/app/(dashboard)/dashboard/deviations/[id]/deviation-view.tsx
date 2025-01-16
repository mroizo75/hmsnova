'use client'

import { DeviationDetails } from "./deviation-details"
import { MeasureList } from "@/components/deviations/measure-list"
import { useRouter } from "next/navigation"

interface DeviationViewProps {
  deviation: any // Type dette bedre basert på din Prisma-modell
  id: string
}

export function DeviationView({ deviation, id }: DeviationViewProps) {
  const router = useRouter()

  return (
    <div>
      <DeviationDetails deviation={deviation} />
      
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-4">Tiltak</h2>
        <MeasureList 
          measures={deviation.measures} 
          deviationId={id}
          onMeasureUpdated={() => {
            router.refresh()
          }}
        />
      </div>
    </div>
  )
} 