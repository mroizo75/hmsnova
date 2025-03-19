"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function ImportStandardTypes() {
  const [isImporting, setIsImporting] = useState(false)
  const router = useRouter()

  const handleImport = async () => {
    try {
      setIsImporting(true)
      
      const response = await fetch("/api/dashboard/competence/types/seed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Noe gikk galt under import")
      }
      
      const data = await response.json()
      
      // Vis suksessmelding
      toast.success(
        data.message || `Importerte ${data.importedTypes.length} standard kompetansetyper`,
        {
          description: data.skippedTypes.length > 0 
            ? `${data.skippedTypes.length} eksisterende typer ble hoppet over.` 
            : undefined,
          duration: 5000
        }
      )
      
      // Oppdater siden for å vise nye typer
      router.refresh()
      
    } catch (error) {
      console.error("Importfeil:", error)
      toast.error(`Feil under import: ${(error as Error).message}`)
    } finally {
      setIsImporting(false)
    }
  }
  
  return (
    <Button 
      variant="outline" 
      onClick={handleImport}
      disabled={isImporting}
    >
      <Download className="mr-2 h-4 w-4" />
      {isImporting ? "Importerer..." : "Importer standardtyper"}
    </Button>
  )
} 