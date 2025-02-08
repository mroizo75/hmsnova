"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { EquipmentList } from "./equipment-list"
import { CreateEquipmentDialog } from "./create-equipment-dialog"
import { EquipmentFilters } from "./equipment-filters"
import { Equipment } from "@prisma/client"

interface Props {
  initialEquipment: Equipment[]
}

export function EquipmentClient({ initialEquipment }: Props) {
  const [equipment, setEquipment] = useState(initialEquipment)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    status: "",
    needsInspection: false,
    hasDeviations: false
  })

  // Filtrer utstyr basert på søk og status
  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = !filters.search || 
      item.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.serialNumber?.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.location?.toLowerCase().includes(filters.search.toLowerCase())

    const matchesType = !filters.type || filters.type === "all" || 
      item.type === filters.type

    const matchesStatus = !filters.status || filters.status === "all" || 
      item.status === filters.status

    const matchesInspection = !filters.needsInspection || 
      (item.nextInspection && new Date(item.nextInspection) <= new Date())

    const matchesDeviations = !filters.hasDeviations || 
      item.status === "NEEDS_ATTENTION"

    return matchesSearch && matchesType && matchesStatus && 
           matchesInspection && matchesDeviations
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Utstyr</h1>
          <p className="text-muted-foreground">
            Administrer bedriftens utstyr og maskiner
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nytt utstyr
        </Button>
      </div>

      <EquipmentFilters 
        onFiltersChange={newFilters => {
          setFilters(prev => ({ ...prev, ...newFilters }))
        }} 
      />

      <EquipmentList 
        equipment={filteredEquipment as (Equipment & { deviations: { id: string }[] })[]}
        onUpdate={(updatedEquipment) => {
          setEquipment(prev => 
            prev.map(e => e.id === updatedEquipment.id ? updatedEquipment : e)
          )
        }}
      />

      <CreateEquipmentDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={(newEquipment) => {
          setEquipment(prev => [newEquipment, ...prev])
          setCreateDialogOpen(false)
        }}
      />
    </div>
  )
} 