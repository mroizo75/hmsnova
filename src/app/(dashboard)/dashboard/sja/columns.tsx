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
import { pdf } from "@react-pdf/renderer"

interface ColumnsProps {
  onEdit: (sja: SJAWithRelations) => void
  onBehandle: (sja: SJAWithRelations) => void
  onSlett: (sja: SJAWithRelations) => void
  onGeneratePDF: (sja: SJAWithRelations) => void
  isGeneratingPDF: boolean
}

export const columns = ({ 
  onEdit, 
  onBehandle, 
  onSlett, 
  onGeneratePDF,
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
    cell: ({ row }) => formatDate(row.getValue("startDato"))
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
          <Button
            variant="outline"
            size="icon"
            onClick={async () => {
              try {
                // Hent full SJA data med alle relasjoner
                const response = await fetch(`/api/sja/${sja.id}`)
                if (!response.ok) throw new Error('Kunne ikke hente SJA data')
                const fullSjaData = await response.json()
                
                // Valider nødvendige felter
                if (!fullSjaData || !fullSjaData.tittel) {
                  throw new Error('Mangler nødvendig SJA-data')
                }

                // Forbered data for PDF
                const pdfData = {
                  ...fullSjaData,
                  produkter: fullSjaData.produkter || [],
                  godkjenninger: fullSjaData.godkjenninger || [],
                  company: fullSjaData.company || { name: '', orgNumber: '' }
                }
                
                // Generer PDF med forberedt data
                const blob = await pdf(<SJAPDFDocument sja={pdfData} />).toBlob()
                const url = URL.createObjectURL(blob)
                window.open(url)
              } catch (error) {
                console.error('Feil ved generering av PDF:', error)
                toast.error('Kunne ikke generere PDF: ' + (error instanceof Error ? error.message : 'Ukjent feil'))
              }
            }}
            disabled={isGeneratingPDF}
            title="Generer PDF"
          >
            <FileDown className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  }
] 