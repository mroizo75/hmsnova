import { MeasureList } from "@/components/risk-assessment/measure-list"

// I hazard-seksjonen hvor tiltakene vises
<div className="mt-4">
  <h4 className="font-medium mb-2">Tiltak</h4>
  <MeasureList 
    measures={assessment.measures.filter(
      measure => measure.hazardId === hazard.id
    ).map(measure => ({
      id: measure.id,
      description: measure.description,
      type: measure.type,
      status: measure.status,
      priority: measure.priority,
      hazardId: measure.hazardId
    }))}
    type="risk" 
  />
</div> 