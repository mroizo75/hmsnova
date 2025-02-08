"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils/date"
import { EquipmentInspection } from "@prisma/client"
import { ChevronRight, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import Link from "next/link"

interface Props {
  inspections: {
    id: string
    equipmentId: string
    type: string
    status: string
    findings: string | null
    nextInspection: Date | null
    inspectorId: string
    inspector: { name: string }
    comments: string | null
    createdAt: Date
    completedAt: Date | null
    equipment: { name: string }
  }[]
  onUpdate: (inspection: any) => void
}

export function InspectionsList({ inspections, onUpdate }: Props) {
  function getStatusBadge(status: string) {
    switch (status) {
      case 'PASSED':
        return <Badge variant="success">Godkjent</Badge>
      case 'FAILED':
        return <Badge variant="destructive">Ikke godkjent</Badge>
      case 'NEEDS_ATTENTION':
        return <Badge variant="warning">Krever oppfølging</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      {inspections.map(inspection => (
        <Card key={inspection.id}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{inspection.equipment.name}</h3>
                  {getStatusBadge(inspection.status)}
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <div className="font-medium">{inspection.type}</div>
                  <div className="text-sm text-muted-foreground">
                    Inspektør: {inspection.inspector.name}
                    <br />
                    {formatDate(inspection.createdAt)}
                  </div>
                  {inspection.findings && (
                    <p>Funn: {inspection.findings}</p>
                  )}
                </div>
              </div>

              <Link href={`/dashboard/equipment/inspections/${inspection.id}`}>
                <Button variant="ghost" size="icon">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 