"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { FareSymbolSelect } from "../../fare-symbol-select"
import { PPESymbol, FareSymbol } from "@prisma/client"
import { cn } from "@/lib/utils"
import { PPESymbolBadge } from "../../ppe-symbol-badge"
import { FareSymbolBadge } from "../../fare-symbol-badge"

// Definer PPE_GROUPS som i add-product-dialog
const PPE_GROUPS = {
  'Personlig verneutstyr': [
    'M003_WEAR_EAR_PROTECTION',
    'M004_WEAR_EYE_PROTECTION',
    'M007_WEAR_OPAQUE_EYE_PROTECTION',
    'M008_WEAR_FOOT_PROTECTION',
    'M009_WEAR_PROTECTIVE_GLOVES',
    'M010_WEAR_PROTECTIVE_CLOTHING',
    'M013_WEAR_FACE_SHIELD',
    'M014_WEAR_HEAD_PROTECTION',
    'M015_WEAR_HIGH_VISIBILITY',
    'M016_WEAR_MASK',
    'M017_WEAR_RESPIRATORY_PROTECTION',
    'M018_WEAR_SAFETY_HARNESS',
    'M026_USE_PROTECTIVE_APRON',
    'M047_USE_BREATHING_EQUIPMENT',
    'M059_WEAR_LAB_COAT'
    // ... resten av PPE symbolene
  ] as PPESymbol[],
  'Hygiene og sikkerhet': [
    'M011_WASH_HANDS',
    'M022_USE_BARRIER_CREAM'
  ] as PPESymbol[]
}

interface EditProductFormProps {
  product: any // Type this properly based on your Prisma schema
}

export function EditProductForm({ product }: EditProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    produktnavn: product.produktnavn,
    produsent: product.produsent || "",
    databladUrl: product.databladUrl || "",
    beskrivelse: product.beskrivelse || "",
    bruksomrade: product.bruksomrade || "",
    fareSymboler: product.fareSymboler?.map((f: any) => f.symbol) || [],
    ppeSymboler: product.ppeSymboler?.map((p: any) => p.symbol) || []
  })

  const togglePPE = (symbol: PPESymbol) => {
    setFormData(prev => ({
      ...prev,
      ppeSymboler: prev.ppeSymboler.includes(symbol)
        ? prev.ppeSymboler.filter((s: PPESymbol) => s !== symbol)
        : [...prev.ppeSymboler, symbol]
    }))
  }

  const toggleFareSymbol = (symbol: FareSymbol) => {
    setFormData(prev => ({
      ...prev,
      fareSymboler: prev.fareSymboler.includes(symbol)
        ? prev.fareSymboler.filter((s: FareSymbol) => s !== symbol)
        : [...prev.fareSymboler, symbol]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/stoffkartotek/${product.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          companyId: product.companyId
        }),
      })

      if (!response.ok) throw new Error("Failed to update product")

      router.push("/dashboard/stoffkartotek")
      router.refresh()
    } catch (error) {
      console.error("Error updating product:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-1">Produktnavn</label>
        <Input
          value={formData.produktnavn}
          onChange={(e) => setFormData({ ...formData, produktnavn: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Produsent</label>
        <Input
          value={formData.produsent}
          onChange={(e) => setFormData({ ...formData, produsent: e.target.value })}
        />
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium">Faresymboler</label>
        <div className="grid grid-cols-3 gap-2">
          {Object.values(FareSymbol).map((symbol) => (
            <button
              key={symbol}
              type="button"
              onClick={() => toggleFareSymbol(symbol)}
              className={cn(
                "flex items-center justify-start w-full p-2 rounded-lg transition-all",
                formData.fareSymboler.includes(symbol)
                  ? "bg-primary/10 ring-2 ring-primary shadow-sm"
                  : "hover:bg-muted/60"
              )}
            >
              <FareSymbolBadge 
                symbol={symbol} 
                showLabel 
                selected={formData.fareSymboler.includes(symbol)} 
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Beskrivelse</label>
        <Textarea
          value={formData.beskrivelse}
          onChange={(e) => setFormData({ ...formData, beskrivelse: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Bruksområde</label>
        <Textarea
          value={formData.bruksomrade}
          onChange={(e) => setFormData({ ...formData, bruksomrade: e.target.value })}
        />
      </div>

      {/* PPE Symboler */}
      <div className="space-y-4">
        <label className="block text-sm font-medium">Påkrevd verneutstyr</label>
        {Object.entries(PPE_GROUPS).map(([groupName, symbols]) => (
          <div key={groupName} className="space-y-2">
            <h4 className="text-sm font-medium">{groupName}</h4>
            <div className="grid grid-cols-3 gap-2">
              {symbols.map((symbol) => (
                <button
                  key={symbol}
                  type="button"
                  onClick={() => togglePPE(symbol)}
                  className={cn(
                    "flex items-center justify-start w-full p-2 rounded-lg transition-all",
                    formData.ppeSymboler.includes(symbol)
                      ? "bg-primary/10 ring-2 ring-primary shadow-sm"
                      : "hover:bg-muted/60"
                  )}
                >
                  <PPESymbolBadge 
                    symbol={symbol} 
                    showLabel 
                    selected={formData.ppeSymboler.includes(symbol)} 
                  />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Avbryt
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Lagrer..." : "Lagre endringer"}
        </Button>
      </div>
    </form>
  )
} 