export interface Section {
  id: string
  title: string
  content: string
  order: number
  parentId: string | null
  changes: Array<{
    id: string
    title: string
    description: string
    createdAt: Date
  }>
} 