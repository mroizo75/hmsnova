"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface Company {
  id: string
  name: string
}

interface AssignTemplateDialogProps {
  templateId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AssignTemplateDialog({
  templateId,
  open,
  onOpenChange,
  onSuccess
}: AssignTemplateDialogProps) {
  const [loading, setLoading] = useState(false)
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<string>("")
  const [openCombobox, setOpenCombobox] = useState(false)

  // Hent bedrifter når dialogen åpnes
  useEffect(() => {
    if (open) {
      fetchCompanies()
    }
  }, [open])

  const fetchCompanies = async () => {
    try {
      const response = await fetch("/api/admin/companies")
      if (!response.ok) throw new Error("Kunne ikke hente bedrifter")
      const data = await response.json()
      setCompanies(data)
    } catch (error) {
      console.error("Error fetching companies:", error)
      toast.error("Kunne ikke hente bedrifter")
    }
  }

  const handleAssign = async () => {
    if (!selectedCompany) {
      toast.error("Velg en bedrift")
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/admin/safety-round-templates/${templateId}/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyId: selectedCompany
        }),
      })

      if (!response.ok) throw new Error("Kunne ikke tildele mal")

      toast.success("Mal tildelt til bedrift")
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error assigning template:", error)
      toast.error("Kunne ikke tildele mal")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tildel mal til bedrift</DialogTitle>
          <DialogDescription>
            Velg hvilken bedrift som skal få tilgang til denne malen
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openCombobox}
                className="w-full justify-between"
              >
                {selectedCompany
                  ? companies.find((company) => company.id === selectedCompany)?.name
                  : "Velg bedrift..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Søk etter bedrift..." />
                <CommandEmpty>Ingen bedrifter funnet.</CommandEmpty>
                <CommandGroup>
                  {companies.map((company) => (
                    <CommandItem
                      key={company.id}
                      onSelect={() => {
                        setSelectedCompany(company.id)
                        setOpenCombobox(false)
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedCompany === company.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {company.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Avbryt
            </Button>
            <Button
              onClick={handleAssign}
              disabled={loading || !selectedCompany}
            >
              {loading ? "Tildeler..." : "Tildel mal"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 