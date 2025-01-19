import { SafetyRound as PrismaSafetyRound } from "@prisma/client"

export type SafetyRoundStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED'

export interface ChecklistItem {
  id: string
  category: string
  question: string
  description: string | null
  response: string | null
  comment: string | null
  imageUrl: string | null
  order: number
  isRequired: boolean
  completedAt: string | null
  completedBy: string | null
  safetyRoundId: string
}

export interface SafetyRoundMeasure {
  id: string
  description: string
  status: string
  priority: string
  dueDate: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
  estimatedCost: number | null
}

export interface SafetyRoundFinding {
  id: string
  description: string
  severity: string
  status: string
  location: string | null
  imageUrl: string | null
  dueDate: string | null
  checklistItemId: string
  measures: SafetyRoundMeasure[]
}

export interface ExtendedSafetyRound extends PrismaSafetyRound {
  status: SafetyRoundStatus
  assignedUser: {
    name: string
    email: string
  } | null
  checklistItems: ChecklistItem[]
  findings: SafetyRoundFinding[]
} 