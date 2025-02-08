"use client"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { useState, useEffect } from "react"
import { useDebounce } from "@/hooks/use-debounce"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

interface Props {
  onFiltersChange: (filters: any) => void
}

export function InspectionFilters({ onFiltersChange }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const debouncedSearch = useDebounce(search, 300)

  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined
  )
  const [dateTo, setDateTo] = useState<Date | undefined>(
    searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined
  )

  // Oppdater URL og filtrer når søk endres
  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    if (debouncedSearch) {
      params.set('search', debouncedSearch)
    } else {
      params.delete('search')
    }
    router.push(`${pathname}?${params.toString()}`)
    onFiltersChange({ search: debouncedSearch })
  }, [debouncedSearch])

  // Håndter endring av andre filtre
  const handleFilterChange = (key: string, value: string | Date | null) => {
    const params = new URLSearchParams(searchParams)
    
    if (value) {
      if (value instanceof Date) {
        params.set(key, value.toISOString())
      } else {
        params.set(key, value)
      }
    } else {
      params.delete(key)
    }
    
    router.push(`${pathname}?${params.toString()}`)
    onFiltersChange({ [key]: value })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Søk i utstyr eller funn..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        
        <Select
          onValueChange={(value) => handleFilterChange('type', value)}
          defaultValue={searchParams.get('type') || "all"}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Type inspeksjon" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle typer</SelectItem>
            <SelectItem value="ROUTINE">Rutine</SelectItem>
            <SelectItem value="MAINTENANCE">Vedlikehold</SelectItem>
            <SelectItem value="CERTIFICATION">Sertifisering</SelectItem>
          </SelectContent>
        </Select>

        <Select
          onValueChange={(value) => handleFilterChange('status', value)}
          defaultValue={searchParams.get('status') || "all"}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle statuser</SelectItem>
            <SelectItem value="PASSED">Godkjent</SelectItem>
            <SelectItem value="FAILED">Ikke godkjent</SelectItem>
            <SelectItem value="NEEDS_ATTENTION">Krever oppfølging</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm">Fra dato:</span>
          <DatePicker
            date={dateFrom}
            onSelect={(date: Date | undefined) => handleFilterChange('dateFrom', date || null)}
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm">Til dato:</span>
          <DatePicker
            date={dateTo}
            onSelect={(date: Date | undefined) => handleFilterChange('dateTo', date || null)}
          />
        </div>
      </div>
    </div>
  )
} 