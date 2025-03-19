"use client"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown 
} from "lucide-react"
import { useState, useEffect } from "react"
import { useDebounce } from "@/hooks/use-debounce"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"

interface Props {
  onFiltersChange: (filters: any) => void
}

const sortOptions = [
  { value: 'name', label: 'Navn' },
  { value: 'type', label: 'Type' },
  { value: 'status', label: 'Status' },
  { value: 'updatedAt', label: 'Sist oppdatert' },
  { value: 'lastInspection', label: 'Sist inspisert' },
  { value: 'nextInspection', label: 'Neste inspeksjon' },
]

function EquipmentFiltersInner({ onFiltersChange }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const debouncedSearch = useDebounce(search, 300)

  const [sortField, setSortField] = useState(searchParams.get('sortField') || 'updatedAt')
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc')

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
  const handleFilterChange = (key: string, value: string | boolean) => {
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set(key, value.toString())
    } else {
      params.delete(key)
    }
    router.push(`${pathname}?${params.toString()}`)
    onFiltersChange({ [key]: value })
  }

  const handleSortChange = (field: string) => {
    const params = new URLSearchParams(searchParams)
    const currentOrder = params.get('sortOrder') || 'desc'
    const currentField = params.get('sortField')
    
    if (currentField === field) {
      // Bytt rekkefølge hvis samme felt
      params.set('sortOrder', currentOrder === 'desc' ? 'asc' : 'desc')
    } else {
      // Sett nytt felt og standard rekkefølge
      params.set('sortField', field)
      params.set('sortOrder', 'desc')
    }
    
    router.push(`${pathname}?${params.toString()}`)
    onFiltersChange({ 
      sortField: field, 
      sortOrder: params.get('sortOrder') 
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Søk etter navn, serienummer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        
        <Select
          onValueChange={(value) => handleFilterChange('type', value)}
          defaultValue={searchParams.get('type') || "all"}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle typer</SelectItem>
            <SelectItem value="MACHINE">Maskin</SelectItem>
            <SelectItem value="TOOL">Verktøy</SelectItem>
            <SelectItem value="VEHICLE">Kjøretøy</SelectItem>
            <SelectItem value="SAFETY">Sikkerhetsutstyr</SelectItem>
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
            <SelectItem value="ACTIVE">Aktiv</SelectItem>
            <SelectItem value="INACTIVE">Inaktiv</SelectItem>
            <SelectItem value="MAINTENANCE">Under vedlikehold</SelectItem>
            <SelectItem value="DISPOSED">Avhendet</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-4 border-t pt-4">
        <span className="text-sm font-medium">Sorter etter:</span>
        <div className="flex flex-wrap gap-2">
          {sortOptions.map(({ value, label }) => (
            <Button
              key={value}
              variant={sortField === value ? "secondary" : "ghost"}
              size="sm"
              onClick={() => handleSortChange(value)}
              className="gap-2"
            >
              {label}
              {sortField === value && (
                sortOrder === 'desc' ? 
                  <ArrowDown className="h-4 w-4" /> : 
                  <ArrowUp className="h-4 w-4" />
              )}
              {sortField !== value && <ArrowUpDown className="h-4 w-4 opacity-50" />}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="needsInspection"
            checked={searchParams.get('needsInspection') === 'true'}
            onCheckedChange={(checked) => 
              handleFilterChange('needsInspection', checked)
            }
          />
          <label htmlFor="needsInspection">
            Trenger inspeksjon
          </label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="hasDeviations"
            checked={searchParams.get('hasDeviations') === 'true'}
            onCheckedChange={(checked) => 
              handleFilterChange('hasDeviations', checked)
            }
          />
          <label htmlFor="hasDeviations">
            Har aktive avvik
          </label>
        </div>
      </div>
    </div>
  )
}

export function EquipmentFilters({ onFiltersChange }: Props) {
  return (
    <Suspense fallback={<div>Laster filtre...</div>}>
      <EquipmentFiltersInner onFiltersChange={onFiltersChange} />
    </Suspense>
  )
} 