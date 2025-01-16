"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, FileText, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Produkt {
  id: string
  produktnavn: string
  fareSymboler: Array<{ symbol: string }>
  sikkerhetsblad_url?: string | null
}

interface StoffkartotekViewerProps {
  produkter: Produkt[]
}

export function StoffkartotekViewer({ produkter }: StoffkartotekViewerProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredProdukter = produkter.filter(produkt =>
    produkt.produktnavn.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
                <div className="space-y-1.5">
                  <h3 className="font-medium">{produkt.produktnavn}</h3>
                  
                  {/* Faresymboler */}
                  {produkt.fareSymboler.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {produkt.fareSymboler.map((symbol, index) => (
                        <Badge 
                          key={`${produkt.id}-${index}`}
                          variant="secondary"
                          className="bg-orange-100 text-orange-700 hover:bg-orange-100"
                        >
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {symbol.symbol}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sikkerhetsdatablad-knapp */}
                {produkt.sikkerhetsblad_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-4"
                    asChild
                  >
                    <a 
                      href={produkt.sikkerhetsblad_url}
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