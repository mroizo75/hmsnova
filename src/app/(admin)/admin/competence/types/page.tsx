import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { Separator } from "@/components/ui/separator"
import { BookUser, Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"

export default async function CompetenceTypesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user || !['ADMIN', 'SUPPORT', 'COMPANY_ADMIN'].includes(session.user.role)) {
    redirect('/login')
  }

  // Hent alle kompetansetyper for bedriften
  const competenceTypes = await prisma.competenceType.findMany({
    where: { 
      companyId: session.user.companyId,
    },
    orderBy: { 
      category: 'asc'
    }
  })

  return (
    <div className="space-y-6 p-6 pb-16">
      <div className="flex justify-between items-center">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <BookUser className="h-6 w-6 text-muted-foreground" />
            <h2 className="text-2xl font-bold tracking-tight">Kompetansetyper</h2>
          </div>
          <p className="text-muted-foreground">
            Administrer ulike typer kompetanse og sertifikater
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/competence/types/new">
            <Plus className="mr-2 h-4 w-4" />
            Ny kompetansetype
          </Link>
        </Button>
      </div>
      <Separator />
      
      <div>
        <DataTable 
          columns={columns} 
          data={competenceTypes} 
          searchColumn="name"
        />
      </div>
    </div>
  )
} 