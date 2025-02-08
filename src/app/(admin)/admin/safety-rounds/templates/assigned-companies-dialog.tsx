"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Building2, X } from "lucide-react"
import { toast } from "sonner"
import { useEffect } from "react"
import { useState } from "react"

interface AssignedCompaniesDialogProps {
  templateId: string
  templateName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onUnassign: (companyId: string) => void
}

interface Company {
  id: string
  name: string
}

export function AssignedCompaniesDialog({
  templateId,
  templateName,
  open,
  onOpenChange,
  onUnassign
}: AssignedCompaniesDialogProps) {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      fetchAssignedCompanies()
    }
  }, [open, templateId])

  const fetchAssignedCompanies = async () => {
    try {
      const response = await fetch(`/api/admin/safety-rounds/templates/${templateId}/companies`)
      if (!response.ok) throw new Error("Kunne ikke hente tilknyttede bedrifter")
      const data = await response.json()
      setCompanies(data)
    } catch (error) {
      console.error("Error fetching assigned companies:", error)
      toast.error("Kunne ikke hente tilknyttede bedrifter")
    }
  }

  const handleUnassign = async (companyId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/safety-rounds/templates/${templateId}/unassign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ companyId }),
      })

      if (!response.ok) throw new Error("Kunne ikke fjerne tilknytning")

      setCompanies(prev => prev.filter(c => c.id !== companyId))
      onUnassign(companyId)
      toast.success("Tilknytning fjernet")
    } catch (error) {
      console.error("Error unassigning company:", error)
      toast.error("Kunne ikke fjerne tilknytning")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tilknyttede bedrifter - {templateName}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4">
          {companies.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Building2 className="h-8 w-8 mb-2" />
              <p>Ingen tilknyttede bedrifter</p>
            </div>
          ) : (
            <div className="space-y-2">
              {companies.map(company => (
                <div
                  key={company.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{company.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={loading}
                    onClick={() => handleUnassign(company.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
} 