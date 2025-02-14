import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { DataTable } from "./data-table"
import { columns } from "./columns"
import { AddEmployeeDialog } from "./add-employee-dialog"
import { Card } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"

type Employee = {
  id: string
  name: string | null
  email: string
  role: string
  phone: string | null
  image: string | null
  address: any
  certifications: {
    machineCards: string[]
    driverLicenses: string[]
  }
  metadata: any
  createdAt: Date
}

export default async function EmployeesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  // Hent ansatte direkte fra databasen
  const users = await prisma.user.findMany({
    where: { 
      companyId: session.user.companyId 
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      image: true,
      address: true,
      certifications: true,
      createdAt: true
    }
  })

  // Formater dataene på samme måte som API-en
  const employees: Employee[] = users.map(user => {
    // Parse certifications hvis det er en string
    let certData: Employee['certifications'] = { machineCards: [], driverLicenses: [] }
    
    if (user.certifications) {
      try {
        const parsed = typeof user.certifications === 'string' 
          ? JSON.parse(user.certifications)
          : user.certifications
        
        certData = {
          machineCards: parsed.machineCards || [],
          driverLicenses: parsed.driverLicenses || []
        }
      } catch (error) {
        console.error("Failed to parse certifications:", error)
      }
    }

    return {
      ...user,
      metadata: {},
      certifications: certData
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