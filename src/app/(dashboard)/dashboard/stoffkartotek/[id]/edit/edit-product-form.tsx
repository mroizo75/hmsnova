"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { FareSymbolSelect } from "../../fare-symbol-select"

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
    fareSymboler: product.fareSymboler.map((f: any) => f.symbol)
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/stoffkartotek/${product.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
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
    <form onSubmit={handleSubmit} className="space-y-4">
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

      <div>
        <label className="block text-sm font-medium mb-1">Faresymboler</label>
        <FareSymbolSelect
          value={formData.fareSymboler}
          onChange={(symbols) => setFormData({ ...formData, fareSymboler: symbols })}
        />
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