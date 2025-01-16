"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils/date"

export interface Company {
  id: string
  name: string
  orgNumber: string
  organizationType: string
  isVerified: boolean
  isActive: boolean
  paymentStatus: 'PAID' | 'PENDING' | 'OVERDUE' | 'CANCELLED'
  createdAt: string
  modules: Array<{
    key: string
    isActive: boolean
  }>
}

export const columns: ColumnDef<Company>[] = [
  {
    accessorKey: "name",
    header: "Bedrift"
  },
  {
    accessorKey: "orgNumber",
    header: "Org.nummer"
  },
  {
    accessorKey: "organizationType",
    header: "Type"
  },
  {
    accessorKey: "isVerified",
    header: "Status",
    cell: ({ row }) => {
      const isVerified = row.getValue("isVerified")
      return (
        <Badge variant={isVerified ? "success" : "secondary"}>
          {isVerified ? "Verifisert" : "Ikke verifisert"}
        </Badge>
      )
    }
  },
  {
    accessorKey: "paymentStatus",
    header: "Betaling",
    cell: ({ row }) => {
      const status = row.getValue("paymentStatus")
      return (
        <Badge variant={
          status === 'PAID' ? "success" :
          status === 'PENDING' ? "warning" :
          status === 'OVERDUE' ? "destructive" :
          "secondary"
        }>
          {status === 'PAID' ? "Betalt" :
           status === 'PENDING' ? "Venter" :
           status === 'OVERDUE' ? "Forfalt" :
           "Kansellert"}
        </Badge>
      )
    }
  },
  {
    accessorKey: "createdAt",
    header: "Opprettet",
    cell: ({ row }) => formatDate(row.getValue("createdAt"))
  }
] 