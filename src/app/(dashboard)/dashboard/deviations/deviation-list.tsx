"use client"

import React, { useState, useMemo } from "react"
import { DeviationCard } from "./deviation-card"
import { FilterBar, FilterOptions, SortOptions } from "./filter-bar"

interface Measure {
  id: string
  description: string
  type: string
  status: string
  priority: string
  dueDate: Date | null
  completedAt: Date | null
}

interface DeviationImage {
  id: string
  url: string
  caption: string | null
}

interface Deviation {
  id: string
  title: string
  description: string
  type: string
  category: string
  severity: string
  status: string
  location: string | null
  dueDate: Date | null
  measures: Measure[]
  images: DeviationImage[]
  createdAt: Date
  updatedAt: Date
  closedAt: Date | null
  createdBy: string
  reportedBy: string
  completedMeasures: number
  totalMeasures: number
}

interface Props {
  deviations: Deviation[]
}

export function DeviationList({ deviations: initialDeviations }: Props) {
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

  const filteredDeviations = useMemo(() => {
    return initialDeviations.filter(deviation => {
      const matchesSearch = 
        filters.search === "" ||
        deviation.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        deviation.description.toLowerCase().includes(filters.search.toLowerCase())

      const matchesStatus = 
        filters.status === "all" || 
        deviation.status === filters.status

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
  }, [initialDeviations, filters])

  const sortedDeviations = useMemo(() => {
    return [...filteredDeviations].sort((a, b) => {
      const aValue = a[sort.field as keyof typeof a]
      const bValue = b[sort.field as keyof typeof b]

      if (aValue === null) return 1
      if (bValue === null) return -1

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      return sort.direction === "asc" ? comparison : -comparison
    })
  }, [filteredDeviations, sort])

  if (initialDeviations.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        Ingen avvik funnet
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <FilterBar
        filters={filters}
        sort={sort}
        onFilterChange={setFilters}
        onSortChange={setSort}
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