import { FindingSeverity, MeasureStatus, Priority, SafetyRound as PrismaSafetyRound } from "@prisma/client"

export interface SafetyRoundTemplate {
  id: string
  name: string
  description?: string | null
  industry?: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  createdBy: string
  version: number
  sections: SafetyRoundTemplateSection[]
}

export interface SafetyRoundTemplateSection {
  id: string
  title: string
  description?: string | null
  order: number
  checkpoints: SafetyRoundCheckpoint[]
}

export interface SafetyRoundCheckpoint {
  id: string
  question: string
  description?: string | null
  type: CheckpointType
  isRequired: boolean
  order: number
  options?: any
}

export enum CheckpointType {
  YES_NO = 'YES_NO',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  PHOTO = 'PHOTO'
}

export interface CreateTemplateInput {
  name: string
  description?: string
  industry?: string
  sections: {
    title: string
    description?: string
    order: number
    checkpoints: {
      question: string
      description?: string
      type: CheckpointType
      isRequired: boolean
      order: number
      options?: any
    }[]
  }[]
}

export enum SafetyRoundStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  APPROVED = 'APPROVED'
}

export interface SafetyRound {
  id: string
  title: string
  description?: string | null
  status: SafetyRoundStatus
  scheduledDate?: Date | null
  dueDate?: Date | null
  completedAt?: Date | null
  createdAt: Date
  updatedAt: Date
  moduleId: string
  module: {
    id: string
    key: string
    label: string
  }
  createdBy: string
  creator: {
    id: string
    name: string
  }
  assignedTo?: string | null
  assignedUser?: {
    id: string
    name: string
  } | null
  approvedAt?: Date | null
  approvedBy?: string | null
  companyId: string
  company: {
    id: string
    name: string
  }
  templateId?: string | null
  template?: {
    id: string
    name: string
    isActive: boolean
  } | null
  findings: SafetyRoundFinding[]
  checklistItems: SafetyRoundChecklistItem[]
  approvals: SafetyRoundApproval[]
  report?: SafetyRoundReport | null
}

export interface SafetyRoundFinding {
  id: string
  description: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'
  location?: string | null
  imageUrl?: string | null
  dueDate?: Date | null
  createdAt: Date
  updatedAt: Date
  safetyRoundId: string
  checklistItemId: string
  createdBy: string
  assignedTo?: string | null
  measures: SafetyRoundMeasure[]
}

export interface SafetyRoundMeasure {
  id: string
  description: string
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED'
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  dueDate?: Date | null
  completedAt?: Date | null
  createdAt: Date
  updatedAt: Date
  findingId: string
  createdBy: string
  completedBy?: string | null
  assignedTo?: string | null
  estimatedCost?: number | null
}

export interface SafetyRoundChecklistItem {
  id: string
  category: string
  question: string
  description?: string | null
  response?: string | null
  comment?: string | null
  imageUrl?: string | null
  order: number
  isRequired: boolean
  completedAt?: Date | null
  completedBy?: string | null
  safetyRoundId: string
  findings: SafetyRoundFinding[]
}

export interface SafetyRoundApproval {
  id: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  token: string
  expiresAt: Date
  approvedAt?: Date | null
  approvedBy?: string | null
  safetyRoundId: string
}

export interface SafetyRoundReport {
  id: string
  title: string
  description: string | null
  completedAt: Date | null
  findings: Array<{
    id: string
    description: string
    severity: FindingSeverity
    status: string
    measures: Array<{
      id: string
      description: string
      completedAt: Date | null
    }>
    images: Array<{
      id: string
      url: string
    }>
  }>
}

export interface SafetyRoundResponse {
  id: string
  checkpointId: string
  response: string | boolean | number
  comment?: string
  images?: string[]
  createdAt: Date
  updatedAt: Date
}

export interface CreateSafetyRoundInput {
  title: string
  description?: string
  companyId: string
  templateId?: string
  assignedTo?: string
  scheduledDate?: Date
  dueDate?: Date
}

export interface UpdateSafetyRoundInput {
  title?: string
  description?: string
  status?: SafetyRoundStatus
  assignedTo?: string
  scheduledDate?: Date
  dueDate?: Date
  checklistItems?: {
    id?: string
    response?: string
    comment?: string
    imageUrl?: string
    completedAt?: Date
    completedBy?: string
  }[]
}

export interface CreateFindingInput {
  description: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  location?: string
  imageUrl?: string
  dueDate?: Date
  checklistItemId: string
  assignedTo?: string
}

export interface CreateMeasureInput {
  description: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  dueDate?: Date
  findingId: string
  assignedTo?: string
  estimatedCost?: number
}

export interface SafetyRoundReportDetails extends PrismaSafetyRound {
  findings: Array<{
    id: string
    severity: FindingSeverity
    description: string
    location: string | null
    status: string
    images: Array<{
      id: string
      url: string
    }>
    measures: Array<{
      id: string
      description: string
      dueDate: Date | null
      completedAt: Date | null
      status: MeasureStatus
      priority: Priority
      assignedTo: string | null
    }>
  }>
  checklistItems: Array<{
    id: string
    category: string
    question: string
    response: string | null
    comment: string | null
    findings: Array<any>
    images: Array<{
      id: string
      url: string
    }>
  }>
  assignedUser: {
    name: string | null
    email: string
  } | null
  participants: Array<{
    user: {
      name: string | null
      email: string
    }
  }>
} 