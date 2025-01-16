"use client"

import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"

interface SafetyRoundReportListProps {
  reports: any[] // Type this properly based on your Prisma schema
}

export function SafetyRoundReportList({ reports }: SafetyRoundReportListProps) {
  return (
    <DataTable 
      columns={columns} 
      data={reports}
      searchColumn="reportNumber"
    />
  )
} 