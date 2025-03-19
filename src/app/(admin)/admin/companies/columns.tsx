"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils/date"
import { Check, X } from "lucide-react"

export interface Company {
  id: string
  name: string
  orgNumber: string
  organizationType: string
  isVerified: boolean
  isActive: boolean
  paymentStatus: 'PAID' | 'PENDING' | 'OVERDUE' | 'CANCELLED'
  createdAt: string
  lastPaymentDate: string | Date | null
  modules: Array<{
    key: string
    isActive: boolean
  }>
  subscriptionPlan: string
  employeeCount: number
  storageLimit: number
  includeVernerunde: boolean
}

export const columns: ColumnDef<Company>[] = [
  {
    accessorKey: "name",
    header: "Bedrift"
  },
  {
    accessorKey: "orgNumber",
    header: "Org.nummer"
  },
  {
    accessorKey: "organizationType",
    header: "Type"
  },
  {
    accessorKey: "isVerified",
    header: "Status",
    cell: ({ row }) => {
      const isVerified = row.getValue("isVerified")
      return (
        <Badge variant={isVerified ? "secondary" : "outline"}>
          {isVerified ? "Verifisert" : "Ikke verifisert"}
        </Badge>
      )
    }
  },
  {
    accessorKey: "paymentStatus",
    header: "Betaling",
    cell: ({ row }) => {
      const status = row.getValue("paymentStatus")
      return (
        <Badge variant={
          status === 'PAID' ? "secondary" :
          status === 'PENDING' ? "default" :
          status === 'OVERDUE' ? "destructive" :
          "outline"
        }>
          {status === 'PAID' ? "Betalt" :
           status === 'PENDING' ? "Venter" :
           status === 'OVERDUE' ? "Forfalt" :
           "Kansellert"}
        </Badge>
      )
    }
  },
  {
    accessorKey: "createdAt",
    header: "Opprettet",
    cell: ({ row }) => formatDate(row.getValue("createdAt"))
  },
  {
    accessorKey: "subscriptionPlan",
    header: "Pakke",
    cell: ({ row }) => {
      const plan = row.getValue("subscriptionPlan") as string
      return (
        <div className="flex items-center">
          <Badge variant={
            plan === "PREMIUM" ? "default" : 
            "secondary"
          }>
            {plan === "PREMIUM" ? "Premium" : "Standard"}
          </Badge>
        </div>
      )
    },
  },
  {
    id: "bht",
    header: "BHT",
    cell: ({ row }) => {
      // Sjekk om det eksisterer en BHT-modul
      const modules = row.original.modules || [];
      const hasBHT = modules.some(module => 
        module.key?.includes('BHT_') && module.isActive
      );
      
      return hasBHT ? 
        <span className="text-green-600"><Check size={18} /></span> : 
        <span className="text-gray-400"><X size={18} /></span>;
    }
  },
  {
    accessorKey: "includeVernerunde",
    header: "Vernerunde",
    cell: ({ row }) => {
      const hasVernerunde = row.getValue("includeVernerunde") as boolean;
      return hasVernerunde ? 
        <span className="text-green-600"><Check size={18} /></span> : 
        <span className="text-gray-400"><X size={18} /></span>;
    }
  },
  {
    accessorKey: "employeeCount",
    header: "Ansatte",
  },
  {
    accessorKey: "storageLimit",
    header: "Lagring (GB)",
  },
] 