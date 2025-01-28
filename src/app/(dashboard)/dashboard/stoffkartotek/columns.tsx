import { ColumnDef } from "@tanstack/react-table"
import { FareSymbolBadge } from "./fare-symbol-badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, FileText } from "lucide-react"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { FareSymbol } from "@prisma/client"

interface FareSymbolMapping {
  id: string
  symbol: string
}

interface Produkt {
  id: string
  produktnavn: string
  produsent: string | null
  databladUrl: string | null
  beskrivelse: string | null
  bruksomrade: string | null
  fareSymboler: FareSymbolMapping[]
}

interface TableMeta {
  isDeleting: boolean;
  onDelete?: (id: string) => void;
}

export const columns: ColumnDef<Produkt>[] = [
  {
    accessorKey: "produktnavn",
    header: "Produktnavn",
  },
  {
    accessorKey: "produsent",
    header: "Produsent",
  },
  {
    accessorKey: "fareSymboler",
    header: "Faresymboler",
    cell: ({ row }) => {
      const fareSymboler = row.original.fareSymboler
      return (
        <div className="flex gap-1">
          {fareSymboler?.map((symbol: FareSymbolMapping) => (
            <FareSymbolBadge key={symbol.id} symbol={symbol.symbol as FareSymbol} />
          ))}
        </div>
      )
    }
  },
  {
    accessorKey: "databladUrl",
    header: "Datablad",
    cell: ({ row }) => {
      const localUrl = row.getValue("databladUrl") as string | null
      
      if (!localUrl) return null

      // Konverter lokal URL til Google Cloud Storage URL
      const transformUrl = (url: string) => {
        if (!url) return url
        if (url.startsWith('http')) return url
        
        // Bruk samme proxy-rute som i employee-visningen
        return `/api/stoffkartotek/datablad?path=${encodeURIComponent(url)}`
      }

      const cloudUrl = transformUrl(localUrl)

      return (
        <Button variant="ghost" size="sm" asChild>
          <a href={cloudUrl} target="_blank" rel="noopener noreferrer">
            <FileText className="w-4 h-4 mr-2" />
            Vis datablad
          </a>
        </Button>
      )
    }
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const meta = table.options.meta as TableMeta;
      const product = row.original
      const isDeleting = meta.isDeleting as boolean

      return (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/dashboard/stoffkartotek/${product.id}/edit`}>
              <Edit className="w-4 h-4" />
              <span className="sr-only">Rediger</span>
            </Link>
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
                <span className="sr-only">Slett</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Er du sikker?</AlertDialogTitle>
                <AlertDialogDescription>
                  Dette vil permanent slette produktet "{product.produktnavn}" fra stoffkartoteket.
                  Denne handlingen kan ikke angres.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Avbryt</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    const onDelete = meta.onDelete as ((id: string) => void) | undefined
                    if (onDelete) {
                      onDelete(product.id)
                    }
                  }}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Slett produkt
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )
    },
  },
] 