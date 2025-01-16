"use client"

import { useRouter } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface CompanySelectProps {
  companies: {
    id: string
    name: string
  }[]
  selectedCompanyId?: string
  category: string
}

export function CompanySelect({ companies, selectedCompanyId, category }: CompanySelectProps) {
  const router = useRouter()

  return (
    <div className="flex items-center space-x-4">
      <label className="text-sm font-medium">Filtrer på bedrift:</label>
      <Select
        value={selectedCompanyId || "all"}
        onValueChange={(value) => {
          if (value === "all") {
            router.push(`/admin/dashboard/${category}`)
          } else {
            router.push(`/admin/dashboard/${category}?companyId=${value}`)
          }
        }}
      >
        <SelectTrigger className="w-[250px]">
          <SelectValue placeholder="Velg bedrift" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle bedrifter</SelectItem>
          {companies.map((company) => (
            <SelectItem key={company.id} value={company.id}>
              {company.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
} 