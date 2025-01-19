"use client";

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { useState } from "react"
import { AddStoffkartotekModal } from "./add-product-dialog"
import { ProductTable } from "./product-table"
import { Stoffkartotek } from "@prisma/client"
import { useToast } from "@/hooks/use-toast"

interface StoffkartotekClientProps {
  products: (Stoffkartotek & {
    fareSymboler: { symbol: string }[]
  })[]
}

export function StoffkartotekClient({ products: initialProducts }: StoffkartotekClientProps) {
  const [products, setProducts] = useState(initialProducts)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const handleAddProduct = (newProduct: Stoffkartotek & { fareSymboler: { symbol: string }[] }) => {
    setProducts([...products, newProduct])
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Er du sikker på at du vil slette dette produktet?')) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/stoffkartotek/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Kunne ikke slette produktet')
      }

      setProducts(products.filter(p => p.id !== id))
      toast({
        title: "Produkt slettet",
        description: "Produktet ble slettet fra stoffkartoteket",
      })
    } catch (error) {
      console.error('Error deleting product:', error)
      toast({
        title: "Feil",
        description: "Kunne ikke slette produktet. Prøv igjen senere.",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Stoffkartotek</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Legg til produkt
        </Button>
      </div>

      <Card className="p-6">
        <ProductTable 
          products={products} 
          onDelete={handleDeleteProduct}
          isDeleting={isDeleting}
        />
      </Card>

      <AddStoffkartotekModal 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        onAdd={async (formData: FormData) => {
          const response = await fetch('/api/stoffkartotek', {
            method: 'POST',
            body: formData
          });
          const newProduct = await response.json();
          handleAddProduct(newProduct);
        }}
      />
    </div>
  )
} 