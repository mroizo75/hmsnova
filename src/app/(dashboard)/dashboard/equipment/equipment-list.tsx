"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils/date"
import { Equipment } from "@prisma/client"
import { ChevronRight, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import Link from "next/link"

interface Props {
  equipment: (Equipment & {
    deviations: { id: string }[]
  })[]
  onUpdate: (equipment: Equipment) => void
}

export function EquipmentList({ equipment, onUpdate }: Props) {
  function getStatusBadge(status: string) {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="success">Aktiv</Badge>
      case 'INACTIVE':
        return <Badge variant="secondary">Inaktiv</Badge>
      case 'MAINTENANCE':
        return <Badge variant="warning">Under vedlikehold</Badge>
      case 'DISPOSED':
        return <Badge variant="outline">Avhendet</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      {equipment.map(item => (
        <Card key={item.id}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Link href={`/dashboard/equipment/${item.id}`}>
                    <h3 className="font-semibold hover:text-primary hover:underline cursor-pointer">
                      {item.name}
                    </h3>
                  </Link>
                  {getStatusBadge(item.status)}
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p>Type: {item.type}</p>
                  <p>Kategori: {item.category}</p>
                  {item.serialNumber && (
                    <p>Serienummer: {item.serialNumber}</p>
                  )}
                  {item.location && (
                    <p>Plassering: {item.location}</p>
                  )}
                </div>

                <div className="flex items-center gap-4 mt-2">
                  {item.lastInspection && (
                    <div className="flex items-center gap-1 text-sm">
                      <CheckCircle className="h-4 w-4" />
                      Sist inspisert: {formatDate(item.lastInspection)}
                    </div>
                  )}
                  {item.nextInspection && (
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="h-4 w-4" />
                      Neste inspeksjon: {formatDate(item.nextInspection)}
                    </div>
                  )}
                  {item.deviations.length > 0 && (
                    <div className="flex items-center gap-1 text-sm text-yellow-600">
                      <AlertTriangle className="h-4 w-4" />
                      {item.deviations.length} aktive avvik
                    </div>
                  )}
                </div>
              </div>

              <Link href={`/dashboard/equipment/${item.id}`}>
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