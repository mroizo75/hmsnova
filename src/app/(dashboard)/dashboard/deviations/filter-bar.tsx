"use client"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search, SortAsc, SortDesc } from "lucide-react"
import React from "react"

interface FilterBarProps {
  onFilterChange: (filters: FilterOptions) => void
  onSortChange: (sort: SortOptions) => void
  filters: FilterOptions
  sort: SortOptions
}

export interface FilterOptions {
  search: string
  status: string
  type: string
  severity: string
  category: string
}

export interface SortOptions {
  field: string
  direction: "asc" | "desc"
}

const statusOptions = [
  { value: "all", label: "Alle statuser" },
  { value: "OPEN", label: "Åpne" },
  { value: "IN_PROGRESS", label: "Under arbeid" },
  { value: "COMPLETED", label: "Fullført" },
  { value: "CLOSED", label: "Lukket" },
]

const typeOptions = [
  { value: "all", label: "Alle typer" },
  { value: "NEAR_MISS", label: "Nestenulykke" },
  { value: "INCIDENT", label: "Hendelse" },
  { value: "ACCIDENT", label: "Ulykke" },
  { value: "IMPROVEMENT", label: "Forbedringsforslag" },
  { value: "OBSERVATION", label: "Observasjon" },
]

const severityOptions = [
  { value: "all", label: "Alle alvorlighetsgrader" },
  { value: "LOW", label: "Lav" },
  { value: "MEDIUM", label: "Middels" },
  { value: "HIGH", label: "Høy" },
  { value: "CRITICAL", label: "Kritisk" },
]

const categoryOptions = [
  { value: "all", label: "Alle kategorier" },
  { value: "HMS", label: "HMS" },
  { value: "KVALITET", label: "Kvalitet" },
  { value: "MILJØ", label: "Miljø" },
  { value: "SIKKERHET", label: "Sikkerhet" },
]

const sortFields = [
  { value: "createdAt", label: "Opprettet dato" },
  { value: "dueDate", label: "Frist" },
  { value: "severity", label: "Alvorlighetsgrad" },
  { value: "status", label: "Status" },
]

export function FilterBar({ onFilterChange, onSortChange, filters, sort }: FilterBarProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: e.target.value })
  }

  const handleStatusChange = (value: string) => {
    onFilterChange({ ...filters, status: value })
  }

  const handleTypeChange = (value: string) => {
    onFilterChange({ ...filters, type: value })
  }

  const handleSeverityChange = (value: string) => {
    onFilterChange({ ...filters, severity: value })
  }

  const handleCategoryChange = (value: string) => {
    onFilterChange({ ...filters, category: value })
  }

  const toggleSortDirection = () => {
    onSortChange({
      ...sort,
      direction: sort.direction === "asc" ? "desc" : "asc"
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Søk i avvik..."
            value={filters.search}
            onChange={handleSearchChange}
            className="pl-8"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSortDirection}
          className="shrink-0"
        >
          {sort.direction === "asc" ? <SortAsc /> : <SortDesc />}
        </Button>
        <Select
          value={sort.field}
          onValueChange={(value) => onSortChange({ ...sort, field: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sorter etter..." />
          </SelectTrigger>
          <SelectContent>
            {sortFields.map((field) => (
              <SelectItem key={field.value} value={field.value}>
                {field.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-wrap gap-4">
        <Select value={filters.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.type} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {typeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.severity} onValueChange={handleSeverityChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Alvorlighetsgrad" />
          </SelectTrigger>
          <SelectContent>
            {severityOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.category} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
} 