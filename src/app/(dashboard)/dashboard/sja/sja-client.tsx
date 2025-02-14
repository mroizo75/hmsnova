"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, AlertTriangle, CheckCircle2, Clock } from "lucide-react"
import { AddSJAModal } from "@/app/(dashboard)/dashboard/sja/add-sja-modal"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SJATable } from "@/app/(dashboard)/dashboard/sja/sja-table"
import { FilterBar, FilterOptions, SortOptions } from "./filter-bar"
import { SJAWithRelations } from "./types"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "react-hot-toast"
import { SlettSJADialog } from "./slett-sja-dialog"

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
  initialData: SJAWithRelations[]
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
  const queryClient = useQueryClient()
  const [slettDialog, setSlettDialog] = useState<{
    open: boolean
    sja: SJAWithRelations | null
  }>({
    open: false,
    sja: null
  })

  // Bruk data fra React Query
  const { data: sjaList = [] } = useQuery({
    queryKey: ['sja-list'],
    queryFn: async () => {
      const response = await fetch('/api/sja')
      if (!response.ok) throw new Error('Kunne ikke hente SJA-er')
      const data = await response.json()
      return Array.isArray(data) ? data : []
    },
    initialData: Array.isArray(initialData) ? initialData : []
  })

  // Bruk sjaList i stedet for initialData
  const activeSJA = sjaList.filter((sja: SJA) => 
    ['UTKAST', 'SENDT_TIL_GODKJENNING'].includes(sja.status || '')
  )
  const completedSJA = sjaList.filter((sja: SJA) => 
    ['GODKJENT', 'AVVIST', 'UTGATT'].includes(sja.status || '')
  )

  // Statistikk basert på sjaList
  const totalSJA = sjaList.length
  const openSJA = sjaList.filter((sja: SJA) => sja.status === 'UTKAST').length
  const inProgressSJA = sjaList.filter((sja: SJA) => sja.status === 'SENDT_TIL_GODKJENNING').length
  const completedSJACount = sjaList.filter((sja: SJA) => sja.status === 'GODKJENT').length

  function handleAddSJA(sja: SJAWithRelations): void {
    console.log('=== handleAddSJA START ===')
    console.log('Incoming SJA:', sja)
    
    try {
      // Sikre at vi har riktig data-struktur
      const sjaData = sja.data || sja
      console.log('Processed sjaData:', sjaData)
      
      // Oppdater cache direkte
      queryClient.setQueryData(['sja-list'], (old: SJAWithRelations[] = []) => {
        console.log('Old cache data:', old)
        const currentData = Array.isArray(old) ? old : []
        const newData = [sjaData, ...currentData]
        console.log('New cache data:', newData)
        return newData
      })
    } catch (error) {
      console.error('=== ERROR IN handleAddSJA ===')
      console.error('Full error:', error)
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack available')
      console.error('Current cache state:', queryClient.getQueryData(['sja-list']))
      toast.error('Kunne ikke opprette SJA')
    }
    console.log('=== handleAddSJA END ===')
  }

  const handleBehandle = (oppdatertSja: SJAWithRelations) => {
    setSlettDialog({
      open: true,
      sja: oppdatertSja
    })
  }

  const handleSlettComplete = (sjaId: string) => {
    setSlettDialog({ open: false, sja: null })
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
          <SJATable 
            data={activeSJA as unknown as SJAWithRelations[]} 
            onBehandle={handleBehandle}
          />
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
          <SJATable 
            data={completedSJA as unknown as SJAWithRelations[]} 
            onBehandle={handleBehandle}
          />
        </TabsContent>
      </Tabs>

      <AddSJAModal 
        open={dialogOpen} 
        onOpenChange={setDialogOpen as (open: boolean | undefined) => void}
        onAdd={handleAddSJA as (sja: SJAWithRelations | undefined) => void}
      />

      {slettDialog.sja && (
        <SlettSJADialog
          sja={slettDialog.sja}
          open={slettDialog.open}
          onOpenChange={(open) => setSlettDialog(prev => ({ ...prev, open }))}
          onSlett={handleSlettComplete}
        />
      )}
    </div>
  )
} 