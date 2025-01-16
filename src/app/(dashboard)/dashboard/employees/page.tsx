import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { DataTable } from "./data-table"
import { columns } from "./columns"
import { AddEmployeeDialog } from "./add-employee-dialog"
import { Card } from "@/components/ui/card"

export default async function EmployeesPage() {
  const session = await getServerSession(authOptions)
  const db = await prisma
  
  const employees = await db.user.findMany({
    where: {
      company: {
        users: {
          some: {
            id: session?.user?.id
          }
        }
      }
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      metadata: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Ansatte</h1>
        <AddEmployeeDialog />
      </div>
      
      <Card className="p-6">
        <DataTable 
          columns={columns} 
          data={employees} 
        />
      </Card>
    </div>
  )
} 