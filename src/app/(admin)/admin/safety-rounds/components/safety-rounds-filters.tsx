"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { Search, SlidersHorizontal } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

interface FiltersProps {
  onFiltersChange: (filters: any) => void
}

export function SafetyRoundsFilters({ onFiltersChange }: FiltersProps) {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<string>("")
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })

  const handleSearch = (value: string) => {
    setSearch(value)
    onFiltersChange({
      search: value,
      status,
      dateRange,
    })
  }

  const handleStatusChange = (value: string) => {
    setStatus(value)
    onFiltersChange({
      search,
      status: value,
      dateRange,
    })
  }

  const handleDateRangeChange = (range: typeof dateRange) => {
    setDateRange(range)
    onFiltersChange({
      search,
      status,
      dateRange: range,
    })
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Søk i vernerunder..."
            className="pl-8"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Alle</SelectItem>
            <SelectItem value="DRAFT">Utkast</SelectItem>
            <SelectItem value="SCHEDULED">Planlagt</SelectItem>
            <SelectItem value="IN_PROGRESS">Pågår</SelectItem>
            <SelectItem value="COMPLETED">Fullført</SelectItem>
            <SelectItem value="APPROVED">Godkjent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Filtrer vernerunder</SheetTitle>
          </SheetHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Dato</label>
              <DatePickerWithRange
                selected={dateRange}
                onSelect={handleDateRangeChange}
              />
            </div>
            {/* Flere filtre kan legges til her */}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
} 