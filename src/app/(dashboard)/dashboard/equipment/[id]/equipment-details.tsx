"use client"

import { Equipment, EquipmentInspection, Document, Deviation } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils/date"
import { CreateInspectionDialog } from "../inspections/create-inspection-dialog"
import { useState } from "react"
import { FileText, Plus, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import Link from "next/link"

interface Props {
  equipment: Equipment & {
    inspections: EquipmentInspection[]
    documents: Document[]
    deviations: Deviation[]
  }
}

export function EquipmentDetails({ equipment }: Props) {
  const [createInspectionOpen, setCreateInspectionOpen] = useState(false)

  function getStatusBadge(status: string) {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="default">Aktiv</Badge>
      case 'INACTIVE':
        return <Badge variant="secondary">Inaktiv</Badge>
      case 'MAINTENANCE':
        return <Badge variant="destructive">Under vedlikehold</Badge>
      case 'DISPOSED':
        return <Badge variant="outline">Avhendet</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  function getDeviationStatusBadge(status: string) {
    switch (status) {
      case 'OPEN':
        return <Badge variant="destructive">Åpen</Badge>
      case 'IN_PROGRESS':
        return <Badge variant="warning">Under behandling</Badge>
      case 'CLOSED':
        return <Badge variant="success">Lukket</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{equipment.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            {getStatusBadge(equipment.status)}
            <span className="text-sm text-muted-foreground">
              Sist oppdatert: {formatDate(equipment.updatedAt)}
            </span>
          </div>
        </div>
        <Button onClick={() => setCreateInspectionOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Ny inspeksjon
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Detaljer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-medium">Type:</span> {equipment.type}
            </div>
            <div>
              <span className="font-medium">Serienummer:</span> {equipment.serialNumber}
            </div>
            <div>
              <span className="font-medium">Plassering:</span> {equipment.location}
            </div>
            <div>
              <span className="font-medium">Neste inspeksjon:</span>{" "}
              {equipment.nextInspection ? formatDate(equipment.nextInspection) : "Ikke planlagt"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Siste inspeksjoner</CardTitle>
            <Link href={`/dashboard/equipment/inspections?equipment=${equipment.id}`}>
              <Button variant="ghost" size="sm">
                Se alle
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {equipment.inspections.map(inspection => (
                <div key={inspection.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{inspection.type}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(inspection.createdAt)}
                    </div>
                  </div>
                  {getStatusBadge(inspection.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Avvik</CardTitle>
            <Link href={`/dashboard/deviations?equipment=${equipment.id}`}>
              <Button variant="ghost" size="sm">
                Se alle
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {equipment.deviations.length === 0 ? (
                <p className="text-sm text-muted-foreground">Ingen registrerte avvik</p>
              ) : (
                equipment.deviations.map(deviation => (
                  <div key={deviation.id} className="flex items-center justify-between">
                    <div>
                      <Link 
                        href={`/dashboard/deviations/${deviation.id}`}
                        className="font-medium hover:underline"
                      >
                        {deviation.title}
                      </Link>
                      <div className="text-sm text-muted-foreground">
                        #{deviation.id.slice(-6)} • {formatDate(deviation.createdAt)}
                      </div>
                    </div>
                    {getDeviationStatusBadge(deviation.status)}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <CreateInspectionDialog
        open={createInspectionOpen}
        onOpenChange={setCreateInspectionOpen}
        onSuccess={(inspection) => {
          // Håndter oppdatering av UI
          setCreateInspectionOpen(false)
        }}
        equipmentId={equipment.id}
      />
    </div>
  )
} 