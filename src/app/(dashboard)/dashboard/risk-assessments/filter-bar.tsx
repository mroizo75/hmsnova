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
import { DatePicker } from "@/components/ui/date-picker"

export interface FilterOptions {
  search: string
  status: string
  dateFrom: Date | undefined
  dateTo: Date | undefined
}

export type SortOptions = "newest" | "oldest" | "title" | "status"

interface FilterBarProps {
  filterOptions: FilterOptions
  onFilterChange: (options: FilterOptions) => void
  sortOption: SortOptions
  onSortChange: (option: SortOptions) => void
}

const statusOptions = [
  { value: "all", label: "Alle statuser" },
  { value: "DRAFT", label: "Utkast" },
  { value: "IN_PROGRESS", label: "Under arbeid" },
  { value: "REVIEW", label: "Under vurdering" },
  { value: "COMPLETED", label: "Fullført" },
  { value: "CLOSED", label: "Lukket" },
]

export function FilterBar({
  filterOptions,
  onFilterChange,
  sortOption,
  onSortChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative flex-1 md:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Søk i risikovurderinger..."
            value={filterOptions.search}
            onChange={(e) => onFilterChange({ ...filterOptions, search: e.target.value })}
            className="pl-9"
          />
        </div>
        <Select
          value={filterOptions.status}
          onValueChange={(value) => onFilterChange({ ...filterOptions, status: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Velg status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-4">
        <DatePicker
          placeholder="Fra dato"
          date={filterOptions.dateFrom}
          setDate={(date: Date | undefined) => onFilterChange({ ...filterOptions, dateFrom: date })}
        />
        <DatePicker
          placeholder="Til dato"
          date={filterOptions.dateTo}
          setDate={(date: Date | undefined) => onFilterChange({ ...filterOptions, dateTo: date })}
        />
        <Select
          value={sortOption}
          onValueChange={(value) => onSortChange(value as SortOptions)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sortering" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Nyeste først</SelectItem>
            <SelectItem value="oldest">Eldste først</SelectItem>
            <SelectItem value="title">Tittel (A-Å)</SelectItem>
            <SelectItem value="status">Status</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
} 