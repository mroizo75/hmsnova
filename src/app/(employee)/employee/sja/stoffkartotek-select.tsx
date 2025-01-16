"use client"

import { useState, useEffect } from "react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StoffkartotekSelectProps {
  value: string[]
  onChange: (value: string[]) => void
}

interface Produkt {
  id: string
  produktnavn: string
  fareSymboler: Array<{ symbol: string }>
}

export function StoffkartotekSelect({ value, onChange }: StoffkartotekSelectProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [produkter, setProdukter] = useState<Produkt[]>([])
  const [selectedProdukter, setSelectedProdukter] = useState<Produkt[]>([])

  useEffect(() => {
    async function fetchProdukter() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/stoffkartotek')
        if (!response.ok) throw new Error('Kunne ikke hente produkter')
        const data = await response.json()
        console.log('Fetched data:', data)
        
        if (!Array.isArray(data)) {
          throw new Error('Forventet array av produkter')
        }
        
        const validatedProdukter = data.map(p => ({
          id: p.id,
          produktnavn: p.produktnavn,
          fareSymboler: Array.isArray(p.fareSymboler) ? p.fareSymboler : []
        }))
        
        console.log('Validated produkter:', validatedProdukter)
        setProdukter(validatedProdukter)
      } catch (error) {
        console.error('Error fetching produkter:', error)
        setError('Kunne ikke laste produkter')
      } finally {
        setLoading(false)
      }
    }

    fetchProdukter()
  }, [])

  useEffect(() => {
    setSelectedProdukter(
      produkter.filter(p => value.includes(p.id))
    )
  }, [value, produkter])

  const toggleProdukt = (produktId: string) => {
    const newValue = value.includes(produktId)
      ? value.filter(id => id !== produktId)
      : [...value, produktId]
    onChange(newValue)
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Laster produkter...</span>
              </>
            ) : (
              <>
                {selectedProdukter.length > 0 
                  ? `${selectedProdukter.length} produkt(er) valgt`
                  : "Velg produkter"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[400px] p-0 bg-white border rounded-md shadow-md" 
          align="start"
        >
          <div className="flex flex-col">
            {loading ? (
              <div className="p-4 text-center">
                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground mt-2">
                  Laster produkter...
                </p>
              </div>
            ) : error ? (
              <div className="p-4 text-center text-destructive">
                {error}
              </div>
            ) : (
              <>
                <div className="border-b p-2">
                  <input
                    className="w-full border-none bg-transparent outline-none placeholder:text-muted-foreground text-sm"
                    placeholder="Søk i produkter..."
                    type="search"
                  />
                </div>
                <div className="max-h-[300px] overflow-auto">
                  {produkter.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Ingen produkter funnet.
                    </div>
                  ) : (
                    produkter.map((produkt) => (
                      <div
                        key={produkt.id}
                        className={cn(
                          "flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors",
                          value.includes(produkt.id) && "bg-gray-50"
                        )}
                        onClick={() => {
                          toggleProdukt(produkt.id)
                          setOpen(false)
                        }}
                      >
                        <Check
                          className={cn(
                            "h-4 w-4 text-primary",
                            value.includes(produkt.id) ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div>
                          <div className="font-medium">{produkt.produktnavn}</div>
                          {produkt.fareSymboler?.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {produkt.fareSymboler.map((symbol, index) => (
                                <Badge 
                                  key={`${produkt.id}-${symbol.symbol}-${index}`} 
                                  variant="secondary"
                                  className="text-xs bg-gray-100"
                                >
                                  {symbol.symbol}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {selectedProdukter.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedProdukter.map((produkt) => (
            <Badge 
              key={produkt.id} 
              variant="secondary"
              className="flex items-center gap-1"
            >
              {produkt.produktnavn}
              <button
                type="button"
                className="ml-1 hover:text-destructive focus:outline-none"
                onClick={(e) => {
                  e.preventDefault()
                  toggleProdukt(produkt.id)
                }}
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
} 