"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils/date"
import { Edit2 } from "lucide-react"

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "name",
    header: "Navn",
    cell: ({ row }) => row.getValue("name") || "Ikke satt"
  },
  {
    accessorKey: "email",
    header: "E-post"
  },
  {
    accessorKey: "role",
    header: "Rolle",
    cell: ({ row }) => {
      const role = row.getValue("role")
      return (
        <Badge variant={role === "ADMIN" ? "default" : "secondary"}>
          {role === "ADMIN" ? "Administrator" : "Support"}
        </Badge>
      )
    }
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive")
      return (
        <Badge variant={isActive ? "success" : "destructive"}>
          {isActive ? "Aktiv" : "Deaktivert"}
        </Badge>
      )
    }
  },
  {
    accessorKey: "createdAt",
    header: "Opprettet",
    cell: ({ row }) => formatDate(row.getValue("createdAt"))
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const user = row.original
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => table.options.meta?.onEdit?.(user)}
        >
          <Edit2 className="h-4 w-4 mr-2" />
          Rediger
        </Button>
      )
    }
  }
] 