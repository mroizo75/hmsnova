"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, FileText } from "lucide-react"
import { FareSymbolBadge } from "@/app/(dashboard)/dashboard/stoffkartotek/fare-symbol-badge"
import { PPESymbolBadge } from "@/app/(dashboard)/dashboard/stoffkartotek/ppe-symbol-badge"
import type { FareSymbol, PPESymbol } from "@prisma/client"

interface Produkt {
  id: string
  produktnavn: string
  fareSymboler: Array<{ symbol: FareSymbol }>
  ppeSymboler: Array<{ symbol: PPESymbol }>
  databladUrl?: string | null
  beskrivelse?: string | null
}

interface StoffkartotekViewerProps {
  produkter: Produkt[]
}

export function StoffkartotekViewer({ produkter }: StoffkartotekViewerProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredProdukter = produkter.filter(produkt =>
    produkt.produktnavn.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Hjelpefunksjon for å generere riktig URL
  const getStorageUrl = (databladUrl: string | null | undefined): string | undefined => {
    if (!databladUrl) return undefined
    if (databladUrl.startsWith('http')) return databladUrl
    
    // Bruk vår egen proxy-rute
    return `/api/stoffkartotek/datablad?path=${encodeURIComponent(databladUrl)}`
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Søkefelt */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Søk i stoffkartotek..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Liste over produkter */}
      <div className="space-y-3">
        {filteredProdukter.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground">
            Ingen produkter funnet
          </Card>
        ) : (
          filteredProdukter.map((produkt) => (
            <Card key={produkt.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h3 className="font-medium">{produkt.produktnavn}</h3>
                  
                  {produkt.beskrivelse && (
                    <p className="text-sm text-muted-foreground">
                      {produkt.beskrivelse}
                    </p>
                  )}
                  
                  {/* Faresymboler */}
                  {produkt.fareSymboler.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Faresymboler:</p>
                      <div className="flex flex-wrap gap-2">
                        {produkt.fareSymboler.map((symbol, index) => (
                          <FareSymbolBadge 
                            key={`${produkt.id}-fare-${index}`}
                            symbol={symbol.symbol}
                            showLabel
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* PPE Symboler */}
                  {produkt.ppeSymboler.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Påkrevd verneutstyr:</p>
                      <div className="flex flex-wrap gap-2">
                        {produkt.ppeSymboler.map((symbol, index) => (
                          <PPESymbolBadge 
                            key={`${produkt.id}-ppe-${index}`}
                            symbol={symbol.symbol}
                            showLabel
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sikkerhetsdatablad-knapp */}
                {produkt.databladUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-4 whitespace-nowrap"
                    asChild
                  >
                    <a 
                      href={getStorageUrl(produkt.databladUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      Sikkerhetsdatablad
                    </a>
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Antall produkter */}
      <p className="text-sm text-muted-foreground text-center">
        Viser {filteredProdukter.length} av {produkter.length} produkter
      </p>
    </div>
  )
} 