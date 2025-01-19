export interface Deviation {
  id: string
  title: string
  description: string
  type: string
  category: string
  severity: string
  status: string
  location: string | null
  dueDate: Date | null
  createdAt: Date
  updatedAt: Date
  closedAt: Date | null
  createdBy: string
  reportedBy: string
  completedMeasures: number
  totalMeasures: number
  priority?: string
  measures: Array<{
    id: string
    description: string
    status: string
    type: string
    priority: string
    dueDate: Date | null
    completedAt: Date | null
  }>
  images?: Array<{
    id: string
    url: string
    caption: string | null
  }>
} 