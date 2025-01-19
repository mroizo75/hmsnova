"use client"

import React, { useState, useMemo } from "react"
import { DeviationCard } from "./deviation-card"
import { FilterBar, FilterOptions, SortOptions } from "./filter-bar"
import type { Deviation } from "@/lib/types/deviation"

interface Props {
  deviations: Deviation[]
}

export function DeviationList({ deviations }: Props) {
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
    return deviations.filter(deviation => {
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

  if (deviations.length === 0) {
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