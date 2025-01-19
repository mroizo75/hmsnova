import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { FileText, Download } from "lucide-react"
import { formatDate } from "@/lib/utils/date"
import { Badge } from "@/components/ui/badge"

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "reportNumber",
    header: "Rapportnummer",
  },
  {
    accessorKey: "safetyRound.title",
    header: "Vernerunde",
  },
  {
    accessorKey: "generatedAt",
    header: "Generert",
    cell: ({ row }) => formatDate(row.getValue("generatedAt")),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge variant={status === "SIGNED" ? "default" : "outline"}>
          {status === "SIGNED" ? "Signert" : "Venter"}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const report = row.original
      return (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <a href={`/api/reports/safety-rounds/${report.id}/view`} target="_blank">
              <FileText className="w-4 h-4 mr-2" />
              Vis rapport
            </a>
          </Button>
          {report.pdfUrl && (
            <Button variant="ghost" size="sm" asChild>
              <a href={report.pdfUrl} download>
                <Download className="w-4 h-4 mr-2" />
                Last ned PDF
              </a>
            </Button>
          )}
        </div>
      )
    },
  },
] 