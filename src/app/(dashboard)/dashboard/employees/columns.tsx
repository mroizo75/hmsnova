"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash2, UserX } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDate } from "@/lib/utils/date"
import { EditEmployeeDialog } from "./edit-employee-dialog"
import { useState } from "react"
import { DeleteEmployeeDialog } from "./delete-employee-dialog"
import { EmployeeDetailsDialog } from "./employee-details-dialog"

export type Employee = {
  id: string
  name: string | null
  email: string
  role: string
  phone: string | null
  image: string | null
  address: any
  metadata: any
  createdAt: Date
}

export const columns: ColumnDef<Employee>[] = [
  {
    accessorKey: "name",
    header: "Navn",
    cell: ({ row }) => {
      const [showDetails, setShowDetails] = useState(false)
      const employee = row.original

      return (
        <>
          <Button
            variant="ghost"
            className="p-0 hover:bg-transparent hover:underline text-left font-medium"
            onClick={() => setShowDetails(true)}
          >
            {employee.name || employee.email}
          </Button>
          
          <EmployeeDetailsDialog
            employee={employee}
            open={showDetails}
            onOpenChange={setShowDetails}
          />
        </>
      )
    }
  },
  {
    accessorKey: "email",
    header: "E-post",
  },
  {
    accessorKey: "role",
    header: "Rolle",
    cell: ({ row }) => {
      const role = row.getValue("role")
      return (
        <div className="font-medium">
          {role === "COMPANY_ADMIN" ? "Administrator" : "Ansatt"}
        </div>
      )
    }
  },
  {
    accessorKey: "createdAt",
    header: "Lagt til",
    cell: ({ row }) => {
      return formatDate(row.getValue("createdAt"))
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const employee = row.original
      const [showEditDialog, setShowEditDialog] = useState(false)
      const [showDeleteDialog, setShowDeleteDialog] = useState(false)

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Handlinger</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Rediger bruker
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Slett bruker
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <EditEmployeeDialog 
            employee={employee}
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
          />

          <DeleteEmployeeDialog
            employee={employee}
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
          />
        </>
      )
    },
  },
] 