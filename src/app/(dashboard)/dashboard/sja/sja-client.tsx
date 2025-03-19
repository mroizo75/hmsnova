"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, AlertTriangle, CheckCircle2, Clock } from "lucide-react"
import { AddSJAModal } from "@/app/(dashboard)/dashboard/sja/add-sja-modal"
import { useState, useEffect, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SJATable } from "@/app/(dashboard)/dashboard/sja/sja-table"
import { FilterBar, FilterOptions, SortOptions } from "./filter-bar"
import { SJAWithRelations } from "./types"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import { toast } from "react-hot-toast"
import { SlettSJADialog } from "./slett-sja-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Pagination } from "@/components/ui/pagination"

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

// Nøkkelen for SJA-listespørring
const SJA_LIST_QUERY_KEY = 'sja-list'

export function SJAClient({ initialData }: SJAClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    search: "",
    status: "all",
    dateFrom: null,
    dateTo: null,
  })
  const [sortOption, setSortOption] = useState<SortOptions>("newest")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const queryClient = useQueryClient()
  const [slettDialog, setSlettDialog] = useState<{
    open: boolean
    sja: SJAWithRelations | null
  }>({
    open: false,
    sja: null
  })

  // Funksjon for å bygge query-parametere
  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams({
      page: currentPage.toString(),
      pageSize: pageSize.toString()
    })

    if (filterOptions.search) params.append('search', filterOptions.search)
    if (filterOptions.status !== 'all') params.append('status', filterOptions.status)
    if (filterOptions.dateFrom) params.append('from', filterOptions.dateFrom.toISOString())
    if (filterOptions.dateTo) params.append('to', filterOptions.dateTo.toISOString())
    
    return params
  }, [currentPage, pageSize, filterOptions])

  // Bruk optimalisert dataspørring med paginering og filtrering
  const { data: sjaData, isLoading, isError } = useQuery({
    queryKey: [SJA_LIST_QUERY_KEY, filterOptions, sortOption, currentPage, pageSize],
    queryFn: async () => {
      const params = buildQueryParams()
      const response = await fetch(`/api/sja?${params.toString()}`)
      if (!response.ok) throw new Error('Kunne ikke hente SJA-er')
      return await response.json()
    },
    initialData: {
      data: Array.isArray(initialData) ? initialData : [],
      pagination: {
        total: initialData.length,
        page: 1,
        pageSize: 10,
        totalPages: Math.ceil(initialData.length / 10)
      }
    },
    // Avanserte caching-strategier
    staleTime: 60 * 1000, // Data er "fersk" i 1 minutt
    gcTime: 5 * 60 * 1000, // Behold cache i 5 minutter
    refetchOnWindowFocus: true, // Oppdater når vinduet får fokus igjen
    refetchOnMount: true, // Oppdater når komponenten monteres
    refetchOnReconnect: true, // Oppdater når nettverkstilkobling gjenopprettes
    retryOnMount: true, // Prøv på nytt ved monteringsfeil
    retry: 3, // Antall forsøk ved feil
  })

  // Bruk sjaData.data i stedet for initialData
  const sjaList = sjaData?.data || []
  const pagination = sjaData?.pagination || { 
    total: initialData.length, 
    page: 1, 
    pageSize: 10, 
    totalPages: Math.ceil(initialData.length / 10)
  }
  
  const activeSJA = sjaList.filter((sja: SJA) => 
    ['UTKAST', 'SENDT_TIL_GODKJENNING'].includes(sja.status || '')
  )
  const completedSJA = sjaList.filter((sja: SJA) => 
    ['GODKJENT', 'AVVIST', 'UTGATT'].includes(sja.status || '')
  )

  // Statistikk basert på sjaList
  const totalSJA = pagination.total || sjaList.length
  const openSJA = sjaList.filter((sja: SJA) => sja.status === 'UTKAST').length
  const inProgressSJA = sjaList.filter((sja: SJA) => sja.status === 'SENDT_TIL_GODKJENNING').length
  const completedSJACount = sjaList.filter((sja: SJA) => sja.status === 'GODKJENT').length

  // Håndter sidenavigasjon
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Håndter filtrering med forsinkelse for å redusere API-kall
  useEffect(() => {
    // Reset til side 1 når filtrering endres
    setCurrentPage(1)
  }, [filterOptions, sortOption])
  
  // Bruk useMutation for å legge til SJA
  const addSJAMutation = useMutation({
    mutationFn: async (nySja: SJAWithRelations) => {
      // Her kan du legge til eventuell ekstra logikk for å opprette SJA
      return nySja;
    },
    onMutate: async (nySja) => {
      // Kanseller eventuelle utestående refetch-er for å unngå race conditions
      await queryClient.cancelQueries({ queryKey: [SJA_LIST_QUERY_KEY] })
      
      // Ta vare på tidligere data for å kunne rulle tilbake
      const previousData = queryClient.getQueryData([SJA_LIST_QUERY_KEY, filterOptions, sortOption, currentPage, pageSize])
      
      // Optimistisk oppdater cache
      queryClient.setQueryData([SJA_LIST_QUERY_KEY, filterOptions, sortOption, currentPage, pageSize], (old: any) => {
        if (!old || !old.data) {
          return {
            data: [nySja],
            pagination: { total: 1, page: 1, pageSize, totalPages: 1 }
          }
        }
        
        const currentData = Array.isArray(old.data) ? old.data : []
        const newData = [nySja, ...currentData]
        
        const newPagination = {
          ...old.pagination,
          total: (old.pagination?.total || 0) + 1,
          totalPages: Math.ceil((old.pagination?.total + 1) / pageSize)
        }
        
        return { data: newData, pagination: newPagination }
      })
      
      return { previousData }
    },
    onError: (error, variables, context) => {
      // Ved feil, rull tilbake til tidligere data
      if (context?.previousData) {
        queryClient.setQueryData(
          [SJA_LIST_QUERY_KEY, filterOptions, sortOption, currentPage, pageSize], 
          context.previousData
        )
      }
      toast.error('Kunne ikke opprette SJA')
      console.error('Feil ved oppretting av SJA:', error)
    },
    onSettled: () => {
      // Uansett resultat, invalider spørringer for å sikre friske data
      queryClient.invalidateQueries({ queryKey: [SJA_LIST_QUERY_KEY] })
    }
  })
  
  function handleAddSJA(sja: SJAWithRelations): void {
    console.log('=== handleAddSJA START ===')
    console.log('Incoming SJA:', sja)
    
    // Bruk mutation i stedet for direkte oppdatering
    const sjaData = (sja as any).data || sja
    addSJAMutation.mutate(sjaData)
    
    console.log('=== handleAddSJA END ===')
  }

  // Bruk useMutation for å slette SJA
  const deleteSJAMutation = useMutation({
    mutationFn: async (sjaId: string) => {
      const response = await fetch(`/api/sja/${sjaId}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Kunne ikke slette SJA')
      return sjaId
    },
    onMutate: async (sjaId) => {
      await queryClient.cancelQueries({ queryKey: [SJA_LIST_QUERY_KEY] })
      
      const previousData = queryClient.getQueryData([SJA_LIST_QUERY_KEY, filterOptions, sortOption, currentPage, pageSize])
      
      // Optimistisk oppdatering - fjern element fra grensesnittet før server svarer
      queryClient.setQueryData([SJA_LIST_QUERY_KEY, filterOptions, sortOption, currentPage, pageSize], (old: any) => {
        if (!old || !old.data) return old
        
        const newData = old.data.filter((sja: SJA) => sja.id !== sjaId)
        const newPagination = {
          ...old.pagination,
          total: Math.max(0, (old.pagination?.total || 0) - 1),
          totalPages: Math.max(1, Math.ceil((old.pagination.total - 1) / pageSize))
        }
        
        return { data: newData, pagination: newPagination }
      })
      
      return { previousData }
    },
    onError: (error, sjaId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          [SJA_LIST_QUERY_KEY, filterOptions, sortOption, currentPage, pageSize], 
          context.previousData
        )
      }
      toast.error('Kunne ikke slette SJA')
      console.error('Feil ved sletting av SJA:', error)
    },
    onSuccess: () => {
      toast.success('SJA slettet')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [SJA_LIST_QUERY_KEY] })
    }
  })

  const handleBehandle = (oppdatertSja: SJAWithRelations) => {
    setSlettDialog({
      open: true,
      sja: oppdatertSja
    })
  }

  const handleSlettComplete = (sjaId: string) => {
    setSlettDialog({ open: false, sja: null })
    deleteSJAMutation.mutate(sjaId)
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
          {isLoading ? (
            <Skeleton className="h-8 w-16 mt-1" />
          ) : (
            <div className="text-2xl font-bold">{totalSJA}</div>
          )}
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <div className="text-sm font-medium">Utkast</div>
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-16 mt-1" />
          ) : (
            <div className="text-2xl font-bold">{openSJA}</div>
          )}
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-500" />
            <div className="text-sm font-medium">Til godkjenning</div>
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-16 mt-1" />
          ) : (
            <div className="text-2xl font-bold">{inProgressSJA}</div>
          )}
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <div className="text-sm font-medium">Godkjent</div>
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-16 mt-1" />
          ) : (
            <div className="text-2xl font-bold">{completedSJACount}</div>
          )}
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
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <SJATable 
              data={activeSJA as unknown as SJAWithRelations[]} 
              onBehandle={handleBehandle}
            />
          )}
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <SJATable 
              data={completedSJA as unknown as SJAWithRelations[]} 
              onBehandle={handleBehandle}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Paginering */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

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