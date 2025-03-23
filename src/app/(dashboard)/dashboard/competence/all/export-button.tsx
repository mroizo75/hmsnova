"use client"

import { useState } from "react"
import { Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "react-hot-toast"

interface ExportToExcelButtonProps {
  className?: string
}

export function ExportToExcelButton({ className }: ExportToExcelButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    try {
      setIsExporting(true)

      const columns = {
        name: true,
        email: true,
        department: true,
        position: true,
        competenceType: true,
        category: true,
        achievedDate: true,
        expiryDate: true,
        status: true
      }

      const response = await fetch('/api/competence/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
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
      size="sm"
      onClick={handleExport}
      disabled={isExporting}
      className={className}
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