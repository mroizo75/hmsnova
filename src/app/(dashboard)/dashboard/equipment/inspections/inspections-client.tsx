"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { InspectionsList } from "./inspections-list"
import { CreateInspectionDialog } from "./create-inspection-dialog"
import { InspectionFilters } from "./inspection-filters"
import { EquipmentInspection } from "@prisma/client"

export interface Inspection extends EquipmentInspection {
  equipment: {
    name: string
  }
  inspector: {
    name: string
  }
  company: {
    id: string
  }
}

interface Props {
  initialInspections: Inspection[]
}

export function InspectionsClient({ initialInspections }: Props) {
  const [inspections, setInspections] = useState<Inspection[]>(initialInspections)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    status: "",
    dateFrom: null as Date | null,
    dateTo: null as Date | null
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inspeksjoner</h1>
          <p className="text-muted-foreground">
            Oversikt over utstyrsinspeksjoner
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Ny inspeksjon
        </Button>
      </div>

      <InspectionFilters onFiltersChange={setFilters} />

      <InspectionsList 
        inspections={inspections}
        onUpdate={(updatedInspection) => {
          setInspections(prev => 
            prev.map(i => i.id === updatedInspection.id ? {
              ...updatedInspection,
              equipment: i.equipment,
              inspector: i.inspector,
              inspectorId: i.inspectorId
            } : i)
          )
        }}
      />

      <CreateInspectionDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={(newInspection) => {
          setInspections(prev => [newInspection, ...prev])
          setCreateDialogOpen(false)
        }}
      />
    </div>
  )
} 