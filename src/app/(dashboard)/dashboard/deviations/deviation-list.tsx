"use client"

import React, { useState, useMemo } from "react"
import { DeviationCard } from "./deviation-card"
import { FilterBar, FilterOptions, SortOptions } from "./filter-bar"
import type { Deviation } from "@/lib/types/deviation"
import { DEVIATION_STATUS, statusLabels } from "@/lib/constants/deviations"

interface Props {
  deviations: Deviation[]
}

// Alle mulige status-verdier vi vil støtte
const ALL_STATUSES = [
  { value: "OPEN", label: "Åpen (Eng)" },
  { value: "AAPEN", label: "Åpen" },
  { value: "IN_PROGRESS", label: "Under arbeid (Eng)" },
  { value: "PAAGAAR", label: "Pågår" },
  { value: "CLOSED", label: "Lukket (Eng)" },
  { value: "LUKKET", label: "Lukket" },
  { value: "COMPLETED", label: "Fullført (Eng)" },
  { value: "FULLFOERT", label: "Fullført" }
]

export function DeviationList({ deviations }: Props) {
  // Legg til logging for debugging
  console.log('DeviationList received deviations:', deviations)

  // Finn alle unike status-verdier fra faktiske avvik
  const uniqueStatuses = [...new Set(deviations.map(d => d.status))]
  console.log('Unique statuses in data:', uniqueStatuses)

  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    status: "all",
    type: "all",
    severity: "all",
    category: "all"
  })

  const [sort, setSort] = useState<SortOptions>({
    field: "createdAt",
    direction: "desc"
  })

  // Status-mapping mellom engelsk og norsk
  const statusMapping = {
    'OPEN': ['OPEN', 'AAPEN'],
    'IN_PROGRESS': ['IN_PROGRESS', 'PAAGAAR'],
    'CLOSED': ['CLOSED', 'LUKKET'],
    'COMPLETED': ['COMPLETED', 'FULLFOERT']
  }

  const filteredDeviations = useMemo(() => {
    return deviations.filter(deviation => {
      const matchesSearch = 
        filters.search === "" ||
        deviation.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        deviation.description.toLowerCase().includes(filters.search.toLowerCase())

      // Oppdatert status-matching som håndterer både engelske og norske verdier
      const matchesStatus = 
        filters.status === "all" || 
        deviation.status === filters.status ||
        Object.values(statusMapping).some(mappedStatuses => 
          mappedStatuses.includes(filters.status) && 
          mappedStatuses.includes(deviation.status)
        )

      const matchesType = 
        filters.type === "all" || 
        deviation.type === filters.type

      const matchesSeverity = 
        filters.severity === "all" || 
        deviation.severity === filters.severity

      const matchesCategory = 
        filters.category === "all" || 
        deviation.category === filters.category

      return matchesSearch && 
             matchesStatus && 
             matchesType && 
             matchesSeverity && 
             matchesCategory
    })
  }, [deviations, filters])

  const sortedDeviations = useMemo(() => {
    return [...filteredDeviations].sort((a, b) => {
      const aValue = a[sort.field as keyof typeof a]
      const bValue = b[sort.field as keyof typeof b]

      if (aValue === undefined || aValue === null) return 1
      if (bValue === undefined || bValue === null) return -1

      return sort.direction === "asc" 
        ? (aValue < bValue ? -1 : aValue > bValue ? 1 : 0)
        : (aValue < bValue ? 1 : aValue > bValue ? -1 : 0)
    })
  }, [filteredDeviations, sort])

  // Sjekk om deviations er undefined eller tom
  if (!deviations || deviations.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        Ingen avvik funnet
      </div>
    )
  }

  // Kombiner alle kjente statuser med de som faktisk finnes i dataene
  const statusOptions = [
    { value: "all", label: "Alle statuser" },
    ...ALL_STATUSES,
    ...uniqueStatuses
      .filter(status => !ALL_STATUSES.some(s => s.value === status))
      .map(status => ({
        value: status,
        label: statusLabels[status] || status
      }))
  ]

  return (
    <div className="space-y-6">
      <FilterBar
        filters={filters}
        sort={sort}
        onFilterChange={setFilters}
        onSortChange={setSort}
        statusOptions={statusOptions}
      />
      <div className="space-y-4">
        {sortedDeviations.map((deviation) => (
          <DeviationCard 
            key={deviation.id} 
            deviation={deviation} 
          />
        ))}
      </div>
    </div>
  )
} 