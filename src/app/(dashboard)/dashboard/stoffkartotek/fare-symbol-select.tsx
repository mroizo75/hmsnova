"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

// Matcher FareSymbol enum fra Prisma schema
const FARE_SYMBOLER = [
  "BRANNFARLIG",
  "ETSENDE",
  "GIFTIG",
  "HELSEFARE",
  "MILJØFARE",
  "EKSPLOSJONSFARLIG",
  "OKSIDERENDE",
  "GASS_UNDER_TRYKK",
  "AKUTT_GIFTIG"
] as const

interface FareSymbolSelectProps {
  value: string[]
  onChange: (value: string[]) => void
}

export function FareSymbolSelect({ value, onChange }: FareSymbolSelectProps) {
  const handleSelect = (symbol: string) => {
    if (!value.includes(symbol)) {
      onChange([...value, symbol])
    }
  }

  const handleRemove = (symbol: string) => {
    onChange(value.filter((s) => s !== symbol))
  }

  return (
    <div className="space-y-2">
      <Select onValueChange={handleSelect}>
        <SelectTrigger>
          <SelectValue placeholder="Velg faresymboler" />
        </SelectTrigger>
        <SelectContent>
          {FARE_SYMBOLER.map((symbol) => (
            <SelectItem 
              key={symbol} 
              value={symbol}
              disabled={value.includes(symbol)}
            >
              {symbol.replace(/_/g, " ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex flex-wrap gap-2">
        {value.map((symbol) => (
          <Badge key={symbol} variant="secondary">
            {symbol.replace(/_/g, " ")}
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 ml-2"
              onClick={() => handleRemove(symbol)}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Fjern</span>
            </Button>
          </Badge>
        ))}
      </div>
    </div>
  )
} 