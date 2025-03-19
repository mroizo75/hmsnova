"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Filter, Search } from "lucide-react"

export function SearchAndFilter({ defaultSearch, categories, defaultCategory }: { 
  defaultSearch?: string, 
  categories: string[],
  defaultCategory?: string
}) {
  const [search, setSearch] = useState(defaultSearch || "")
  const [category, setCategory] = useState(defaultCategory || "")

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (category) params.set("category", category)
    window.location.search = params.toString()
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Søk etter kompetanser..."
          className="pl-8"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
      </div>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <select
            className="w-full h-10 rounded-md border border-input bg-background px-8 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value)
            }}
          >
            <option value="">Alle kategorier</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <Filter className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
        <Button onClick={handleSearch} className="px-3">Søk</Button>
      </div>
    </div>
  )
} 