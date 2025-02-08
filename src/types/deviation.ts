import type { Deviation, DeviationImage, DeviationMeasure, Status, Severity, DeviationType } from "@prisma/client"

export type DeviationWithRelations = Deviation & {
  measures: DeviationMeasure[]
  images: DeviationImage[]
} 