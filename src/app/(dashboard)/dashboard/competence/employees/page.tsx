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

// Typer for å forbedre TypeScript-støtte
interface UserWithCompetencies {
  id: string
  name: string | null
  email: string
  image: string | null
  department?: string | null // Metadata felt
  position?: string | null   // Metadata felt
  competencies: Array<{
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
  }>
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

  // Hent søkeparameter på riktig måte i Next.js 15
  const { search: searchQuery = "" } = await searchParams
  const search = typeof searchQuery === 'string' ? searchQuery : ""

  // Hent alle ansatte i bedriften
  const users = await prisma.user.findMany({
    where: {
      companyId: session.user.companyId,
      isActive: true,
      OR: search ? [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ] : undefined,
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
    ]
  })

  // Beregn statistikk for hver ansatt
  const employeesWithStats = users.map(employee => {
    // Hent metadata for department og position
    const metadata = employee.department || employee.position ? 
      { department: employee.department, position: employee.position } : 
      null

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
      metadata,
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
      <div>
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
      </div>
      
      {/* Ansattoversikt */}
      {employeesWithStats.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <User className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">Ingen ansatte funnet</h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            Ingen ansatte matcher søkekriteriene dine. Prøv å søke med andre ord.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {employeesWithStats.map((employee) => (
            <Card key={employee.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={employee.image || undefined} />
                      <AvatarFallback>{employee.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{employee.name}</CardTitle>
                      <CardDescription>
                        {employee.metadata?.position || employee.metadata?.department || employee.email}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {employee.stats.pending > 0 && (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-800">
                        {employee.stats.pending} venter
                      </Badge>
                    )}
                    {employee.stats.expired > 0 && (
                      <Badge variant="outline" className="bg-red-50 text-red-800">
                        {employee.stats.expired} utløpt
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Kompetansebevis</p>
                    <p className="text-xl font-bold">{employee.stats.total}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Verifisert</p>
                    <p className="text-xl font-bold text-green-600">{employee.stats.verified}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Utløper snart</p>
                    <p className="text-xl font-bold text-orange-600">{employee.stats.expiringSoon}</p>
                  </div>
                </div>
                
                {employee.latestCompetencies.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Nyeste kompetanser</p>
                    <div className="space-y-2">
                      {employee.latestCompetencies.map((comp) => (
                        <div key={comp.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                          <div>
                            <p className="text-sm font-medium">{comp.competenceType.name}</p>
                            <p className="text-xs text-muted-foreground">{comp.competenceType.category}</p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {comp.expiryDate && new Date(comp.expiryDate) < new Date() ? (
                              <Badge variant="outline" className="bg-red-50 text-red-800">Utløpt</Badge>
                            ) : comp.expiryDate ? (
                              <p className="text-xs">{formatDate(comp.expiryDate)}</p>
                            ) : (
                              <Badge variant="outline" className="bg-green-50 text-green-800">Utløper ikke</Badge>
                            )}
                            {comp.verificationStatus === 'VERIFIED' ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : comp.verificationStatus === 'REJECTED' ? (
                              <XCircle className="h-4 w-4 text-red-600" />
                            ) : (
                              <Award className="h-4 w-4 text-yellow-600" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">Ingen kompetansebevis registrert</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/dashboard/competence/employees/${employee.id}`}>
                    Se komplett oversikt
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 