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
      const symbols = row.getValue("fareSymboler") as string[]
      
      return (
        <div className="flex flex-wrap gap-1">
          {symbols.map((symbol, index) => (
            <FareSymbolBadge 
              key={`${row.original.id}-${symbol}-${index}`} 
              symbol={symbol as FareSymbol}
            />
          ))}
        </div>
      )
    },
  },
  {
    accessorKey: "databladUrl",
    header: "Datablad",
    cell: ({ row }) => {
      const localUrl = row.getValue("databladUrl") as string | null
      
      if (!localUrl) return null

      // Konverter lokal URL til Google Cloud Storage URL
      const transformUrl = (url: string) => {
        // Hent ut filnavnet og company ID fra den lokale URL-en
        const matches = url.match(/datablader\/(.*?)\/(.*?)$/)
        if (!matches) return url

        const [_, companyId, filename] = matches
        return `https://storage.cloud.google.com/innutio-hms/datablader/${companyId}/${filename}`
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