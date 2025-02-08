"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ExportButtonsProps {
  safetyRoundId?: string
  showAll?: boolean
}

export function ExportButtons({ safetyRoundId, showAll = false }: ExportButtonsProps) {
  const [loading, setLoading] = useState<"excel" | "pdf" | null>(null)

  const handleExportExcel = async () => {
    try {
      setLoading("excel")
      const response = await fetch(
        `/api/admin/safety-rounds/${safetyRoundId ? `${safetyRoundId}/` : ""}export/excel`
      )
      
      if (!response.ok) throw new Error("Kunne ikke eksportere til Excel")
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `vernerunder-${safetyRoundId || "alle"}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success("Excel-fil eksportert")
    } catch (error) {
      console.error("Error exporting to Excel:", error)
      toast.error("Kunne ikke eksportere til Excel")
    } finally {
      setLoading(null)
    }
  }

  const handleExportPDF = async () => {
    try {
      setLoading("pdf")
      const response = await fetch(
        `/api/admin/safety-rounds/${safetyRoundId ? `${safetyRoundId}/` : ""}export/pdf`
      )
      
      if (!response.ok) throw new Error("Kunne ikke eksportere til PDF")
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `vernerunder-${safetyRoundId || "alle"}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success("PDF eksportert")
    } catch (error) {
      console.error("Error exporting to PDF:", error)
      toast.error("Kunne ikke eksportere til PDF")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportExcel}
        disabled={loading !== null}
      >
        {loading === "excel" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileSpreadsheet className="h-4 w-4 mr-2" />
        )}
        Excel
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportPDF}
        disabled={loading !== null}
      >
        {loading === "pdf" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileText className="h-4 w-4 mr-2" />
        )}
        PDF
      </Button>
      {showAll && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            // Implementer bulk-eksport her
          }}
          disabled={loading !== null}
        >
          <Download className="h-4 w-4 mr-2" />
          Eksporter alle
        </Button>
      )}
    </div>
  )
} 