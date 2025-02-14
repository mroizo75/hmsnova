"use client"

import { ColumnDef } from "@tanstack/react-table"
import { SJAWithRelations } from "./types"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Check, X, Trash2, FileDown, Eye, FileEdit, FileText } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDate } from "@/lib/utils/date"
import { Badge } from "@/components/ui/badge"
import { SJAStatus } from "@prisma/client"
import Link from "next/link"
import { statusLabels } from "@/lib/constants/sja"
import { toast } from "react-hot-toast"
import { SJAPDFDocument } from "./sja-pdf"
import { generatePDF } from "./pdf-utils"
import { format } from "date-fns"

interface ColumnsProps {
  onEdit: (sja: SJAWithRelations) => void
  onBehandle: (sja: SJAWithRelations) => void
  onSlett: (sja: SJAWithRelations) => void
  isGeneratingPDF: boolean
}

export const columns = ({ 
  onEdit, 
  onBehandle, 
  onSlett, 
  isGeneratingPDF 
}: ColumnsProps): ColumnDef<SJAWithRelations>[] => [
  {
    accessorKey: "tittel",
    header: "Tittel"
  },
  {
    accessorKey: "arbeidssted",
    header: "Arbeidssted"
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => statusLabels[row.getValue("status") as SJAStatus]
  },
  {
    accessorKey: "startDato",
    header: "Startdato",
    cell: ({ row }) => {
      const date = row.getValue("startDato")
      try {
        return format(new Date(date as string), 'dd.MM.yyyy')
      } catch (error) {
        console.error('Ugyldig startdato:', error)
        return "-"
      }
    }
  },
  {
    accessorKey: "opprettetDato",
    header: "Opprettet",
    cell: ({ row }) => {
      const date = row.getValue("opprettetDato")
      try {
        return format(new Date(date as string), 'dd.MM.yyyy HH:mm')
      } catch (error) {
        console.error('Ugyldig opprettelsesdato:', error)
        return "-"
      }
    }
  },
  {
    accessorKey: "produkter",
    header: "Produkter",
    cell: ({ row }) => {
      const produkter = row.original.produkter
      return (
        <div className="max-w-[200px] truncate">
          {produkter.map(p => p.produkt.produktnavn).join(", ")}
        </div>
      )
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const sja = row.original
      
      return (
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/sja/${sja.id}`}>
            <Button variant="outline" size="icon" title="Se detaljer">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => onEdit(sja)}
            title="Rediger"
          >
            <FileEdit className="h-4 w-4" />
          </Button>
          {!['GODKJENT', 'AVVIST', 'UTGATT'].includes(sja.status || '') && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => onBehandle(sja)}
              title="Behandle"
            >
              <FileText className="h-4 w-4" />
            </Button>
          )}
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => onSlett(sja)}
            title="Slett"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                disabled={isGeneratingPDF}
                title="Last ned PDF"
              >
                <FileText className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={async () => {
                  try {
                    toast.loading('Genererer PDF...')
                    
                    const response = await fetch(`/api/sja/${sja.id}/pdf`, {
                      headers: {
                        'Accept': 'application/pdf'
                      }
                    })
                    
                    if (!response.ok) {
                      throw new Error('Kunne ikke generere PDF')
                    }
                    
                    // Last ned PDF
                    const blob = await response.blob()
                    const url = window.URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `SJA-${sja.id}.pdf`
                    document.body.appendChild(a)
                    a.click()
                    window.URL.revokeObjectURL(url)
                    document.body.removeChild(a)
                    
                    toast.dismiss()
                    toast.success('PDF generert')
                  } catch (error) {
                    console.error('Feil ved generering av PDF:', error)
                    toast.dismiss()
                    toast.error('Kunne ikke generere PDF')
                  }
                }}
              >
                <FileText className="mr-2 h-4 w-4" />
                <span>Last ned PDF</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  }
] 