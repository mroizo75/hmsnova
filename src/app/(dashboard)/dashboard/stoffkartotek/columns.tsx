import { ColumnDef } from "@tanstack/react-table"
import { FareSymbolBadge } from "./fare-symbol-badge"
import { PPESymbolBadge } from "./ppe-symbol-badge"
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
import { FareSymbol, PPESymbol } from "@prisma/client"

interface FareSymbolMapping {
  id: string
  symbol: string
}

interface PPESymbolMapping {
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
  ppeSymboler: PPESymbolMapping[]
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
      const fareSymboler = row.getValue("fareSymboler") as FareSymbolMapping[]
      if (!fareSymboler?.length) return null
      
      return (
        <div className="flex flex-wrap gap-1">
          {fareSymboler.map(mapping => (
            <FareSymbolBadge key={mapping.id} symbol={mapping.symbol as FareSymbol} />
          ))}
        </div>
      )
    }
  },
  {
    accessorKey: "ppeSymboler",
    header: "Verneutstyr",
    cell: ({ row }) => {
      const rowData = row.original // Get entire row data
      console.log("Full row data:", rowData) // Debug
      
      const ppeSymboler = row.getValue("ppeSymboler") as PPESymbolMapping[]
      console.log("PPE Symboler fra row:", ppeSymboler)
      
      if (!ppeSymboler?.length) {
        console.log("No PPE symbols found") // Debug
        return null
      }
      
      return (
        <div className="flex flex-wrap gap-1">
          {ppeSymboler.map(mapping => {
            console.log("Rendering PPE symbol:", mapping)
            return (
              <PPESymbolBadge 
                key={mapping.id} 
                symbol={mapping.symbol as PPESymbol} 
              />
            )
          })}
        </div>
      )
    }
  },
  {
    accessorKey: "databladUrl",
    header: "Datablad",
    cell: ({ row }) => {
      const url = row.getValue("databladUrl") as string | null
      if (!url) return null
      
      return (
        <Link 
          href={url}
          target="_blank"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <FileText className="w-4 h-4" />
          <span>Åpne</span>
        </Link>
      )
    }
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const product = row.original
      const meta = table.options.meta as TableMeta
      const isDeleting = meta.isDeleting

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost" 
            size="sm"
            asChild
          >
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