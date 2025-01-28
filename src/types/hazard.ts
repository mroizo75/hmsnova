export interface HazardWithRelations {
  id: string
  description: string
  consequence: string
  probability: number
  severity: number
  riskLevel: number
  existingMeasures: string | null
  riskAssessmentId: string
  createdAt: Date
  updatedAt: Date
  hmsChanges: Array<{
    hmsChange: {
      id: string
      title: string
      description: string
      status: string
      changeType: string
    }
  }>
} 