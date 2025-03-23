"use client"

import { useState } from "react"
import { Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "react-hot-toast"

interface ExportFilters {
  employeeId?: string
  competenceTypeId?: string
  category?: string
  status?: string
  expiryStatus?: string
}

interface ColumnsConfig {
  name?: boolean
  email?: boolean
  department?: boolean
  position?: boolean
  competenceType?: boolean
  category?: boolean
  achievedDate?: boolean
  expiryDate?: boolean
  status?: boolean
  expiryStatus?: boolean
}

interface ExportToExcelButtonProps {
  filters: ExportFilters
  columnsConfig: ColumnsConfig
}

export function ExportToExcelButton({ filters, columnsConfig }: ExportToExcelButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    try {
      setIsExporting(true)

      // Bare inkluder kolonner som er markert som aktive i UI-et
      const columns: Record<string, boolean> = {}
      const checkboxes = document.querySelectorAll('input[type="checkbox"][id^="col-"]:checked')
      
      const idToColumnMap: Record<string, string> = {
        "col-user": "name",
        "col-email": "email",
        "col-dep": "department",
        "col-pos": "position",
        "col-type": "competenceType",
        "col-cat": "category",
        "col-achieved": "achievedDate",
        "col-expiry": "expiryDate",
        "col-status": "status"
      }
      
      // Default til å vise alle kolonner hvis ingen er valgt
      if (checkboxes.length === 0) {
        Object.keys(columnsConfig).forEach(key => {
          columns[key] = true
        })
      } else {
        // Bruk kun valgte kolonner fra UI-et
        checkboxes.forEach((checkbox: Element) => {
          const columnName = idToColumnMap[checkbox.id]
          if (columnName) {
            columns[columnName] = true
          }
        })
      }

      const response = await fetch('/api/competence/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...filters,
          columns
        })
      })

      if (!response.ok) {
        throw new Error('Eksport feilet')
      }

      // Håndter nedlasting av Excel-filen
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `kompetanserapport-${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Kompetanserapport eksportert til Excel')
    } catch (error) {
      console.error('Feil ved eksport:', error)
      toast.error('Kunne ikke eksportere rapport')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button 
      variant="outline" 
      type="button" 
      onClick={handleExport}
      disabled={isExporting}
    >
      {isExporting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      Eksporter til Excel
    </Button>
  )
} 