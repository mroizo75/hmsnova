"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatDate } from "@/lib/utils/date"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Measure {
  id: string
  description: string
  type: string
  status: string
  priority: string
  dueDate: Date | null
  completedAt: Date | null
  assignedTo: string | null
}

interface MeasureListProps {
  assessmentId: string
  hazardId: string
  measures: Measure[]
}

const measureTypeLabels: Record<string, string> = {
  ELIMINATION: "Eliminering",
  SUBSTITUTION: "Substitusjon",
  ENGINEERING: "Tekniske tiltak",
  ADMINISTRATIVE: "Administrative tiltak",
  PPE: "Personlig verneutstyr"
}

const priorityColors: Record<string, string> = {
  LOW: "bg-blue-100 text-blue-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HIGH: "bg-orange-100 text-orange-800",
  CRITICAL: "bg-red-100 text-red-800"
}

export function MeasureList({ assessmentId, hazardId, measures }: MeasureListProps) {
  const router = useRouter()

  async function updateStatus(measureId: string, status: string) {
    try {
      const response = await fetch(
        `/api/risk-assessments/${assessmentId}/hazards/${hazardId}/measures/${measureId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status,
            completedAt: status === 'COMPLETED' ? new Date().toISOString() : null
          }),
        }
      )

      if (!response.ok) {
        throw new Error('Kunne ikke oppdatere status')
      }

      toast.success("Status oppdatert")
      router.refresh()
    } catch (error) {
      toast.error("Kunne ikke oppdatere status")
    }
  }

  if (measures.length === 0) {
    return (
      <Card className="p-4">
        <p className="text-sm text-muted-foreground text-center">
          Ingen tiltak er lagt til ennå
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      {measures.map((measure) => (
        <Card key={measure.id} className="p-3">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1">
              <p className="text-sm">{measure.description}</p>
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="secondary">
                  {measureTypeLabels[measure.type]}
                </Badge>
                <Badge 
                  className={priorityColors[measure.priority]}
                >
                  {measure.priority}
                </Badge>
                {measure.dueDate && (
                  <span className="text-muted-foreground">
                    Frist: {formatDate(measure.dueDate)}
                  </span>
                )}
              </div>
            </div>
            <Select
              defaultValue={measure.status}
              onValueChange={(value) => updateStatus(measure.id, value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OPEN">Åpen</SelectItem>
                <SelectItem value="IN_PROGRESS">Pågår</SelectItem>
                <SelectItem value="COMPLETED">Fullført</SelectItem>
                <SelectItem value="CLOSED">Lukket</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>
      ))}
    </div>
  )
} 