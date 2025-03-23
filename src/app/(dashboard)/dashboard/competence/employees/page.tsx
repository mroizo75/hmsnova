import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Award, CheckCircle, Search, User, XCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Prisma } from "@prisma/client"

// Typer for å forbedre TypeScript-støtte
interface CompetenceWithType {
  id: string
  verificationStatus: string
  achievedDate: Date
  expiryDate: Date | null
  updatedAt: Date
  competenceType: {
    id: string
    name: string
    category: string
  }
}

interface UserWithCompetencies {
  id: string
  name: string | null
  email: string
  image: string | null
  metadata: Prisma.JsonValue
  competencies: CompetenceWithType[]
}

interface EmployeeWithStats extends UserWithCompetencies {
  metadata: Prisma.JsonValue
  parsedMetadata: {
    department?: string | null
    position?: string | null
  } | null
  stats: {
    total: number
    verified: number
    pending: number
    expired: number
    expiringSoon: number
  }
  latestCompetencies: CompetenceWithType[]
}

export default async function EmployeeCompetenceOverviewPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect('/login')
  }

  // Sjekk om kompetansemodulen er aktivert for bedriften
  const competenceModule = await prisma.module.findFirst({
    where: {
      companyId: session.user.companyId,
      key: "COMPETENCE",
      isActive: true
    }
  })

  if (!competenceModule) {
    redirect('/dashboard/competence')
  }

  // Hent søkeparameter og pagination-parametre
  const { search: searchQuery = "", page: pageQuery = "1" } = searchParams
  const search = typeof searchQuery === 'string' ? searchQuery : ""
  const currentPage = Number(typeof pageQuery === 'string' ? pageQuery : "1") || 1
  const itemsPerPage = 10
  const skip = (currentPage - 1) * itemsPerPage

  // Hent antall ansatte for paginering
  const totalEmployees = await prisma.user.count({
    where: {
      companyId: session.user.companyId,
      isActive: true,
      ...(search ? {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } }
        ]
      } : {})
    }
  })

  const totalPages = Math.ceil(totalEmployees / itemsPerPage)

  // Hent alle ansatte i bedriften - Med paginering
  const users = await prisma.user.findMany({
    where: {
      companyId: session.user.companyId,
      isActive: true,
      ...(search ? {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } }
        ]
      } : {})
    },
    include: {
      competencies: {
        include: {
          competenceType: true
        },
        orderBy: [
          { updatedAt: 'desc' }
        ],
        take: 5 // Bare vis de 5 nyeste kompetansene på oversikten
      }
    },
    orderBy: [
      { name: 'asc' }
    ],
    skip,
    take: itemsPerPage
  }) as unknown as UserWithCompetencies[]

  // Beregn statistikk for hver ansatt
  const employeesWithStats: EmployeeWithStats[] = users.map(employee => {
    // Parse metadata for å hente department og position
    const metadata = employee.metadata as Record<string, any> | null
    const parsedMetadata = metadata ? {
      department: metadata.department as string | undefined,
      position: metadata.position as string | undefined
    } : null

    const totalCompetencies = employee.competencies.length
    const verifiedCompetencies = employee.competencies.filter(c => c.verificationStatus === 'VERIFIED').length
    const pendingCompetencies = employee.competencies.filter(c => c.verificationStatus === 'PENDING').length
    const expiredCompetencies = employee.competencies.filter(c => {
      if (!c.expiryDate) return false
      return new Date(c.expiryDate) < new Date()
    }).length
    const expiringSoonCompetencies = employee.competencies.filter(c => {
      if (!c.expiryDate) return false
      const now = new Date()
      const expiryDate = new Date(c.expiryDate)
      if (expiryDate < now) return false
      
      const threeMonthsFromNow = new Date()
      threeMonthsFromNow.setMonth(now.getMonth() + 3)
      return expiryDate < threeMonthsFromNow
    }).length

    // Hent bare de siste 5 kompetansene for visning
    const latestCompetencies = [...employee.competencies]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)

    return {
      ...employee,
      parsedMetadata,
      stats: {
        total: totalCompetencies,
        verified: verifiedCompetencies,
        pending: pendingCompetencies,
        expired: expiredCompetencies,
        expiringSoon: expiringSoonCompetencies
      },
      latestCompetencies
    }
  })

  return (
    <div className="space-y-6 p-6 pb-16">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <User className="h-6 w-6 text-muted-foreground" />
            <h2 className="text-2xl font-bold tracking-tight">Ansattes kompetanse</h2>
          </div>
          <p className="text-muted-foreground">
            Oversikt over ansattes kompetanser og sertifiseringer
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/competence">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tilbake til oversikt
          </Link>
        </Button>
      </div>
      <Separator />
      
      {/* Søkefelt */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <form className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            name="search" 
            placeholder="Søk etter ansatt..." 
            className="pl-10 w-full md:w-[300px]" 
            defaultValue={search}
          />
          <Button type="submit" className="absolute right-0 top-0 bottom-0 rounded-l-none">
            Søk
          </Button>
        </form>
        
        <div className="text-sm text-muted-foreground">
          Viser {users.length ? (currentPage - 1) * itemsPerPage + 1 : 0}-{Math.min(currentPage * itemsPerPage, totalEmployees)} av {totalEmployees} ansatte
        </div>
      </div>
      
      {/* Ansattoversikt med tabellvisning */}
      {employeesWithStats.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <User className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">Ingen ansatte funnet</h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            Ingen ansatte matcher søkekriteriene dine. Prøv å søke med andre ord.
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[250px]">
                    Ansatt
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Stilling / Avdeling
                  </th>
                  <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">
                    Total
                  </th>
                  <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">
                    Verifisert
                  </th>
                  <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">
                    Venter
                  </th>
                  <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">
                    Utløpt
                  </th>
                  <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">
                    Utløper snart
                  </th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                    Handling
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {employeesWithStats.map((employee) => (
                  <tr key={employee.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={employee.image || undefined} />
                          <AvatarFallback>{employee.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{employee.name}</p>
                          <p className="text-xs text-muted-foreground">{employee.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      {employee.parsedMetadata?.position || employee.parsedMetadata?.department || "-"}
                    </td>
                    <td className="p-4 align-middle text-center">
                      <span className="font-medium">{employee.stats.total}</span>
                    </td>
                    <td className="p-4 align-middle text-center">
                      <span className="font-medium text-green-600">{employee.stats.verified}</span>
                    </td>
                    <td className="p-4 align-middle text-center">
                      {employee.stats.pending > 0 ? (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-800">
                          {employee.stats.pending}
                        </Badge>
                      ) : (
                        <span>0</span>
                      )}
                    </td>
                    <td className="p-4 align-middle text-center">
                      {employee.stats.expired > 0 ? (
                        <Badge variant="outline" className="bg-red-50 text-red-800">
                          {employee.stats.expired}
                        </Badge>
                      ) : (
                        <span>0</span>
                      )}
                    </td>
                    <td className="p-4 align-middle text-center">
                      {employee.stats.expiringSoon > 0 ? (
                        <Badge variant="outline" className="bg-orange-50 text-orange-800">
                          {employee.stats.expiringSoon}
                        </Badge>
                      ) : (
                        <span>0</span>
                      )}
                    </td>
                    <td className="p-4 align-middle text-right">
                      <Button asChild size="sm">
                        <Link href={`/dashboard/competence/employees/${employee.id}`}>
                          Vis detaljer
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Paginering */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-4">
          <Button 
            variant="outline" 
            size="sm"
            disabled={currentPage === 1}
            asChild
          >
            <Link href={`/dashboard/competence/employees?page=${Math.max(1, currentPage - 1)}&search=${search}`}>
              Forrige
            </Link>
          </Button>
          
          <div className="flex items-center space-x-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Viser enten første 5 sider, eller sider rundt nåværende side
              let pageNum = i + 1;
              if (totalPages > 5 && currentPage > 3) {
                pageNum = Math.min(totalPages - 4, currentPage - 2) + i;
              }
              if (pageNum > totalPages) return null;
              
              return (
                <Button 
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"} 
                  size="sm"
                  asChild
                >
                  <Link href={`/dashboard/competence/employees?page=${pageNum}&search=${search}`}>
                    {pageNum}
                  </Link>
                </Button>
              );
            })}
            
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <>
                <span className="text-muted-foreground">...</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  asChild
                >
                  <Link href={`/dashboard/competence/employees?page=${totalPages}&search=${search}`}>
                    {totalPages}
                  </Link>
                </Button>
              </>
            )}
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            disabled={currentPage === totalPages}
            asChild
          >
            <Link href={`/dashboard/competence/employees?page=${Math.min(totalPages, currentPage + 1)}&search=${search}`}>
              Neste
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
} 