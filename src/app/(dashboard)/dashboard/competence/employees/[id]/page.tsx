import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Award, CheckCircle, Download, FileCheck, PlusCircle, UserCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { notFound } from "next/navigation"

// Funksjoner for å beregne dager til utløp og statusfarge
function getDaysUntil(date: Date | null): number {
  if (!date) return 0
  const now = new Date()
  const expiryDate = new Date(date)
  const diffTime = expiryDate.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'VERIFIED':
      return <Badge className="bg-green-100 text-green-800 border-green-200">Verifisert</Badge>
    case 'REJECTED':
      return <Badge className="bg-red-100 text-red-800 border-red-200">Avvist</Badge>
    default:
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Venter på godkjenning</Badge>
  }
}

function getExpiryBadge(expiryDate: Date | null) {
  if (!expiryDate) {
    return <Badge className="bg-green-100 text-green-800 border-green-200">Utløper ikke</Badge>
  }
  
  const daysUntil = getDaysUntil(expiryDate)
  
  if (daysUntil < 0) {
    return <Badge className="bg-red-100 text-red-800 border-red-200">Utløpt</Badge>
  } else if (daysUntil < 30) {
    return <Badge className="bg-red-100 text-red-800 border-red-200">{daysUntil} dager igjen</Badge>
  } else if (daysUntil < 90) {
    return <Badge className="bg-orange-100 text-orange-800 border-orange-200">{daysUntil} dager igjen</Badge>
  } else {
    return <Badge className="bg-green-100 text-green-800 border-green-200">Gyldig</Badge>
  }
}

export default async function EmployeeCompetenceDetailPage({
  params,
}: {
  params: { id: string }
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
  
  // Hent bruker og deres kompetanser
  const { id } = await params
  const user = await prisma.user.findFirst({
    where: {
      id: id,
      companyId: session.user.companyId
    },
    include: {
      competencies: {
        include: {
          competenceType: true
        },
        orderBy: [
          { verificationStatus: 'asc' },
          { expiryDate: 'asc' }
        ]
      }
    }
  })
  
  if (!user) {
    notFound()
  }
  
  // Grupper kompetanser etter kategori
  const groupedCompetencies: Record<string, typeof user.competencies> = {}
  user.competencies.forEach(comp => {
    const category = comp.competenceType.category
    if (!groupedCompetencies[category]) {
      groupedCompetencies[category] = []
    }
    groupedCompetencies[category].push(comp)
  })
  
  // Hent tilgjengelige kompetansetyper for denne brukeren
  // (brukes for å kunne legge til ny kompetanse)
  const competenceTypes = await prisma.competenceType.findMany({
    where: {
      companyId: session.user.companyId,
      isActive: true
    },
    orderBy: [
      { category: 'asc' },
      { name: 'asc' }
    ]
  })
  
  // Beregn statistikk
  const stats = {
    total: user.competencies.length,
    verified: user.competencies.filter(c => c.verificationStatus === 'VERIFIED').length,
    pending: user.competencies.filter(c => c.verificationStatus === 'PENDING').length,
    rejected: user.competencies.filter(c => c.verificationStatus === 'REJECTED').length,
    expired: user.competencies.filter(c => {
      if (!c.expiryDate) return false
      return new Date(c.expiryDate) < new Date()
    }).length,
    expiringSoon: user.competencies.filter(c => {
      if (!c.expiryDate) return false
      const now = new Date()
      const expiryDate = new Date(c.expiryDate)
      if (expiryDate < now) return false
      
      const threeMonthsFromNow = new Date()
      threeMonthsFromNow.setMonth(now.getMonth() + 3)
      return expiryDate < threeMonthsFromNow
    }).length
  }
  
  return (
    <div className="space-y-6 p-6 pb-16">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <UserCircle className="h-6 w-6 text-muted-foreground" />
            <h2 className="text-2xl font-bold tracking-tight">Ansatts kompetanse</h2>
          </div>
          <p className="text-muted-foreground">
            Detaljoversikt over {user.name}s kompetanser og sertifiseringer
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/competence/employees">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tilbake til ansattoversikt
          </Link>
        </Button>
      </div>
      <Separator />
      
      {/* Ansattinformasjon og statistikk */}
      <div className="flex flex-col md:flex-row gap-6">
        <Card className="md:w-1/3">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.image || undefined} />
                <AvatarFallback className="text-lg">{user.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl">{user.name}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Totalt</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Verifisert</p>
                <p className="text-2xl font-bold text-green-600">{stats.verified}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Utløpte</p>
                <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Utløper snart</p>
                <p className="text-2xl font-bold text-orange-600">{stats.expiringSoon}</p>
              </div>
            </div>
            
            <div className="mt-6 space-y-2">
              <h3 className="text-sm font-medium">Handlinger</h3>
              <div className="space-y-2">
                <Button asChild className="w-full" size="sm">
                  <Link href={`/dashboard/competence/employees/${user.id}/add`}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Legg til kompetanse
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Eksporter oversikt
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:w-2/3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Kompetanseoversikt
            </CardTitle>
            <CardDescription>
              Oversikt over alle registrerte kompetanser og sertifiseringer
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.total === 0 ? (
              <div className="text-center py-6">
                <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">Ingen kompetansebevis registrert</h3>
                <p className="text-muted-foreground mb-6">
                  {user.name} har ingen registrerte kompetansebevis eller sertifiseringer.
                </p>
                <Button asChild>
                  <Link href={`/dashboard/competence/employees/${user.id}/add`}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Legg til kompetanse
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {stats.pending > 0 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileCheck className="h-5 w-5 text-yellow-600" />
                      <p className="text-sm font-medium text-yellow-800">
                        {stats.pending} kompetansebevis venter på godkjenning
                      </p>
                    </div>
                    <Button asChild size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                      <Link href={`/dashboard/competence/verify?userId=${user.id}`}>
                        Verifiser nå
                      </Link>
                    </Button>
                  </div>
                )}
                
                {Object.entries(groupedCompetencies).map(([category, competencies]) => (
                  <div key={category} className="space-y-3">
                    <h3 className="text-lg font-medium border-b pb-1">{category}</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Kompetansetype</TableHead>
                          <TableHead>Oppnådd dato</TableHead>
                          <TableHead>Utløpsdato</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Handlinger</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {competencies.map((comp) => (
                          <TableRow key={comp.id}>
                            <TableCell className="font-medium">{comp.competenceType.name}</TableCell>
                            <TableCell>{formatDate(comp.achievedDate)}</TableCell>
                            <TableCell>
                              {comp.expiryDate ? formatDate(comp.expiryDate) : 'Utløper ikke'}
                              <div className="mt-1">
                                {getExpiryBadge(comp.expiryDate)}
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(comp.verificationStatus)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={`/dashboard/competence/details/${comp.id}`}>
                                    Se detaljer
                                  </Link>
                                </Button>
                                {comp.verificationStatus === 'PENDING' && (
                                  <div className="flex gap-1">
                                    <form action={`/api/dashboard/competence/${comp.id}/verify`} method="POST">
                                      <input type="hidden" name="action" value="approve" />
                                      <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600">
                                        <CheckCircle className="h-4 w-4" />
                                      </Button>
                                    </form>
                                    
                                    <form action={`/api/dashboard/competence/${comp.id}/verify`} method="POST">
                                      <input type="hidden" name="action" value="reject" />
                                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600">
                                        <XCircle className="h-4 w-4" />
                                      </Button>
                                    </form>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 