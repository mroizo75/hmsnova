 "use client"

import { ColumnDef } from "@tanstack/react-table"
import { CompetenceType } from "@prisma/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Edit, Trash, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDate } from "@/lib/utils/date"
import { Switch } from "@/components/ui/switch"
import { useState } from "react"
import { toast } from "sonner"

// Kompetansetypekategorier med riktige farger
const categoryColors: Record<string, string> = {
  "HMS": "bg-red-100 text-red-800",
  "FAGLIG": "bg-blue-100 text-blue-800",
  "LOVPÅLAGT": "bg-orange-100 text-orange-800",
}

export const columns: ColumnDef<CompetenceType>[] = [
  {
    accessorKey: "name",
    header: "Navn",
  },
  {
    accessorKey: "category",
    header: "Kategori",
    cell: ({ row }) => {
      const category = row.getValue("category") as string
      return (
        <Badge className={categoryColors[category] || "bg-gray-100 text-gray-800"}>
          {category}
        </Badge>
      )
    },
  },
  {
    accessorKey: "subcategory",
    header: "Underkategori",
    cell: ({ row }) => {
      const subcategory = row.getValue("subcategory") as string | null
      if (!subcategory) return "-"
      return <span className="text-sm">{subcategory}</span>
    },
  },
  {
    accessorKey: "validity",
    header: "Gyldighet",
    cell: ({ row }) => {
      const validity = row.getValue("validity") as number | null
      if (!validity) return <span className="text-sm text-muted-foreground">Utløper ikke</span>
      return <span className="text-sm">{validity} måneder</span>
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const competenceType = row.original
      const [isActive, setIsActive] = useState(competenceType.isActive)

      const toggleActive = async () => {
        try {
          const newState = !isActive
          const response = await fetch(`/api/admin/competence/types/${competenceType.id}/toggle-status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: newState })
          })

          if (!response.ok) throw new Error("Kunne ikke oppdatere status")
          
          setIsActive(newState)
          toast.success(`Kompetansetypen er nå ${newState ? 'aktiv' : 'inaktiv'}`)
        } catch (error) {
          toast.error("Kunne ikke oppdatere status")
          console.error(error)
        }
      }

      return (
        <div className="flex items-center">
          <Switch
            checked={isActive}
            onCheckedChange={toggleActive}
          />
          <span className="ml-2 text-sm">
            {isActive ? "Aktiv" : "Inaktiv"}
          </span>
        </div>
      )
    }
  },
  {
    accessorKey: "createdAt",
    header: "Opprettet",
    cell: ({ row }) => {
      return formatDate(row.getValue("createdAt") as Date)
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const competenceType = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Åpne meny</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Handlinger</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/admin/competence/types/${competenceType.id}`}>
                <Edit className="mr-2 h-4 w-4" /> Rediger
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/admin/competence/types/${competenceType.id}/delete`}>
                <Trash className="mr-2 h-4 w-4" /> Slett
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]