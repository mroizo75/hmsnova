"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils/date"
import { Check, X, Mail, Phone, ArrowUpRight } from "lucide-react"
import { formatCurrency } from "@/lib/utils/format"
import { Button } from "@/components/ui/button"
import { CaretSortIcon } from "@radix-ui/react-icons"

export interface Company {
  id: string
  name: string
  organizationType: string
  orgNumber?: string
  primaryContact?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
  website?: string
  industry?: string
  size?: string
  createdAt: Date
  status?: string
  activeModules: string[]
  isActive?: boolean
  isVerified?: boolean
  paymentStatus?: string
  billing?: {
    plan: string
    amount: number
    nextBillingDate: Date
    lastBillingDate: Date
  }
  isProspect?: boolean
  username?: string
  password?: string
  prospectStage?: string
  discountPercentage?: number
  discountYears?: number
  salesNotes?: string
  activeOpportunities?: number
  metadata?: any // Metadata som kan inneholde priser, rabatter, etc.
  
  // API-relaterte felter
  contacts?: any[]
  modules?: any[]
  salesOpportunities?: any[]
  potentialValue?: number
  subscriptionPlan?: string
  organizationCode?: string
  primaryEmail?: string // For bakoverkompatibilitet
  employeeCount?: number
}

export const columns: ColumnDef<Company>[] = [
  {
    accessorKey: "name",
    header: () => <div className="text-xs font-medium">Bedrift</div>,
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      return (
        <div className="max-w-[80px] sm:max-w-[120px] truncate font-medium text-xs">
          {name}
        </div>
      );
    },
    size: 100
  },
  {
    accessorKey: "primaryContact",
    header: () => <div className="text-xs font-medium">Kontakt</div>,
    cell: ({ row }) => {
      const contact = row.getValue("primaryContact") as string;
      const email = row.original.email;
      
      return (
        <div className="flex flex-col max-w-[80px] sm:max-w-[120px]">
          <div className="truncate text-xs">{contact}</div>
          {email && (
            <div className="flex items-center text-[10px] text-muted-foreground truncate">
              <Mail className="mr-1 h-2.5 w-2.5 shrink-0" />
              <span className="truncate">{email}</span>
            </div>
          )}
        </div>
      );
    },
    size: 100
  },
  {
    accessorKey: "subscriptionPlan",
    header: () => <div className="text-xs font-medium">Abo.</div>,
    cell: ({ row }) => {
      const plan = row.getValue("subscriptionPlan") as string;
      return (
        <Badge variant={
          plan === "PREMIUM" ? "default" : 
          "secondary"
        } className="whitespace-nowrap text-[10px] px-1 py-0">
          {plan === "PREMIUM" ? "Premium" : "Standard"}
        </Badge>
      );
    },
    size: 60
  },
  {
    accessorKey: "activeModules",
    header: () => <div className="text-xs font-medium">Moduler</div>,
    cell: ({ row }) => {
      const modules = row.getValue("activeModules") as string[];
      const count = modules.length;
      
      return (
        <div className="text-xs">
          {count > 0 ? (
            <Badge variant="outline" className="text-[10px] px-1 py-0">
              {count} moduler
            </Badge>
          ) : (
            <span className="text-[10px] text-muted-foreground">Ingen</span>
          )}
        </div>
      );
    },
    size: 70
  },
  {
    accessorKey: "paymentStatus",
    header: () => <div className="text-xs font-medium">Betaling</div>,
    cell: ({ row }) => {
      const status = row.getValue("paymentStatus");
      return (
        <Badge variant={
          status === 'PAID' ? "secondary" :
          status === 'PENDING' ? "default" :
          status === 'OVERDUE' ? "destructive" :
          "outline"
        } className="whitespace-nowrap text-[10px] px-1 py-0">
          {status === 'PAID' ? "Betalt" :
           status === 'PENDING' ? "Venter" :
           status === 'OVERDUE' ? "Forfalt" :
           "Kansellert"}
        </Badge>
      );
    },
    size: 60
  },
  {
    accessorKey: "potentialValue",
    header: () => <div className="text-xs font-medium">Potensial</div>,
    cell: ({ row }) => {
      const value = row.getValue("potentialValue") as number;
      const opportunities = row.original.activeOpportunities;
      
      if (value === 0) return <span className="text-[10px]">Ingen</span>;
      
      return (
        <div className="flex flex-col">
          <div className="text-xs">{formatCurrency(value, 'nb-NO', 'NOK', 0, true)}</div>
          <div className="text-[10px] text-muted-foreground">
            {opportunities} muligh.
          </div>
        </div>
      );
    },
    size: 80
  },
  {
    accessorKey: "employeeCount",
    header: () => <div className="text-xs font-medium">Ansatte</div>,
    cell: ({ row }) => {
      const count = row.getValue("employeeCount") as number;
      return <span className="text-xs">{count}</span>;
    },
    size: 50
  },
  {
    accessorKey: "isActive",
    header: () => <div className="text-xs font-medium">Status</div>,
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <Badge variant={isActive ? "secondary" : "destructive"} className="whitespace-nowrap text-[10px] px-1 py-0">
          {isActive ? "Aktiv" : "Inaktiv"}
        </Badge>
      );
    },
    size: 60
  },
  {
    accessorKey: "activeOpportunities",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Aktive muligheter
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const oppsCount = row.original.activeOpportunities || 0;
      return (
        <div className="flex items-center">
          <Badge variant={oppsCount > 0 ? "default" : "secondary"}>
            {oppsCount}
          </Badge>
        </div>
      )
    },
  }
] 