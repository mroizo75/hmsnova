"use client"

import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { Stoffkartotek } from "@prisma/client"

interface ProductTableProps {
  products: any[]
  onDelete: (id: string) => void
  isDeleting: boolean
}

export function ProductTable({ products, onDelete, isDeleting }: ProductTableProps) {
  return (
    <DataTable 
      columns={columns} 
      data={products}
      searchColumn="produktnavn"
      meta={{
        onDelete,
        isDeleting
      }}
    />
  )
} 