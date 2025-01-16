"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, AlertTriangle, CheckCircle2, Clock } from "lucide-react"
import { AddSJAModal } from "./add-sja-modal"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SJATable } from "./sja-table"
import { FilterBar, FilterOptions, SortOptions } from "./filter-bar"
import { SJAWithRelations } from "./types"

interface SJA {
  id: string
  tittel: string
  arbeidssted: string
  beskrivelse: string
  startDato: Date
  sluttDato?: Date | null
  status: 'UTKAST' | 'SENDT_TIL_GODKJENNING' | 'GODKJENT' | 'AVVIST' | 'UTGATT'
  risikoer: any[]
  tiltak: any[]
  produkter: any[]
  opprettetDato: Date
  oppdatertDato: Date
}

interface SJAClientProps {
  initialData: SJA[]
}

export function SJAClient({ initialData }: SJAClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    search: "",
    status: "all",
    dateFrom: null,
    dateTo: null,
  })
  const [sortOption, setSortOption] = useState<SortOptions>("newest")

  const activeSJA = initialData.filter(sja => 
    ['UTKAST', 'SENDT_TIL_GODKJENNING'].includes(sja.status)
  )
  const completedSJA = initialData.filter(sja => 
    ['GODKJENT', 'AVVIST', 'UTGATT'].includes(sja.status)
  )

  // Statistikk
  const totalSJA = initialData.length
  const openSJA = initialData.filter(sja => sja.status === 'UTKAST').length
  const inProgressSJA = initialData.filter(sja => sja.status === 'SENDT_TIL_GODKJENNING').length
  const completedSJACount = initialData.filter(sja => sja.status === 'GODKJENT').length

  function handleAddSJA(sja: SJAWithRelations): void {
    throw new Error("Function not implemented.")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Sikker Jobb Analyse</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Ny SJA
        </Button>
      </div>

      {/* Statistikk-kort */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <div className="text-sm font-medium">Totalt</div>
          </div>
          <div className="text-2xl font-bold">{totalSJA}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <div className="text-sm font-medium">Utkast</div>
          </div>
          <div className="text-2xl font-bold">{openSJA}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-500" />
            <div className="text-sm font-medium">Til godkjenning</div>
          </div>
          <div className="text-2xl font-bold">{inProgressSJA}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <div className="text-sm font-medium">Godkjent</div>
          </div>
          <div className="text-2xl font-bold">{completedSJACount}</div>
        </Card>
      </div>

      {/* Filtreringsbar */}
      <FilterBar
        filterOptions={filterOptions}
        onFilterChange={setFilterOptions}
        sortOption={sortOption}
        onSortChange={setSortOption}
      />

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">
            Aktive SJA
          </TabsTrigger>
          <TabsTrigger value="completed">
            Fullførte SJA
          </TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="mt-4">
          <SJATable data={activeSJA} />
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
          <SJATable data={completedSJA} />
        </TabsContent>
      </Tabs>

      <AddSJAModal 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        onAdd={handleAddSJA}
      />
    </div>
  )
} 