"use client"

import { columns, Company } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useState } from "react"
import { CompanyDetailsDialog } from "./company-details-dialog"

interface CompaniesClientProps {
  companies: Company[]
}

export function CompaniesClient({ companies }: CompaniesClientProps) {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const columnsWithActions = [
    ...columns,
    {
      id: "actions",
      cell: ({ row }) => {
        const company = row.original
        const hasVernerundeModule = company.modules?.some(
          (m) => m.key === "SAFETY_ROUNDS" && m.isActive
        )

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setSelectedCompany(company)
                setDialogOpen(true)
              }}
            >
              Detaljer
            </Button>
            {hasVernerundeModule && (
              <Button
                variant="outline"
                onClick={() => {
                  window.location.href = `/admin/companies/${company.id}/safety-rounds`
                }}
              >
                Vernerunder
              </Button>
            )}
          </div>
        )
      }
    }
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Bedrifter</h1>
      </div>
      <DataTable 
        columns={columnsWithActions} 
        data={companies}
        searchColumn="name"
      />
      <CompanyDetailsDialog
        company={selectedCompany}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  )
} 