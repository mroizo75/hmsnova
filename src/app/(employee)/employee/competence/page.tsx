import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, Award, Calendar, Check, Clock, Filter, PlusCircle, Search, UserCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { formatDate } from "@/lib/utils"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Prisma } from "@prisma/client"
import { SearchAndFilter } from "./search-and-filter"

// Definere type for kompetanse med inkludert competenceType
type CompetenceWithType = Prisma.CompetenceGetPayload<{
  include: {
    competenceType: true
  }
}>

// Hjelpefunksjon for å beregne dager til utløp
function getDaysUntil(date: Date | null): number {
  if (!date) return Infinity
  const now = new Date()
  const expiryDate = new Date(date)
  const diffTime = expiryDate.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Hjelpefunksjon for å gruppere kompetanser etter kategori
function groupByCategory(competencies: CompetenceWithType[]) {
  const grouped: Record<string, CompetenceWithType[]> = {}
  competencies.forEach(comp => {
    const category = comp.competenceType.category
    if (!grouped[category]) {
      grouped[category] = []
    }
    grouped[category].push(comp)
  })
  return grouped
}

export default async function EmployeeCompetencePage({
  searchParams,
}: {
  searchParams?: { search?: string, category?: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect('/login')
  }
  
  // Sjekk om kompetansemodulen er aktivert for bedriften (sjekk både COMPETENCE og COMPETENCY)
  const competenceModule = await prisma.module.findFirst({
    where: {
      companyId: session.user.companyId,
      OR: [
        { key: "COMPETENCE", isActive: true },
        { key: "COMPETENCY", isActive: true }
      ]
    }
  })

  if (!competenceModule) {
    redirect('/employee')
  }
  
  // Hent alle kompetanser for denne ansatte
  const competencies = await prisma.competence.findMany({
    where: {
      userId: session.user.id
    },
    include: {
      competenceType: true
    },
    orderBy: [
      { verificationStatus: 'asc' },
      { expiryDate: 'asc' }
    ]
  })
  
  // Filtrer kompetanser basert på søkeparametre
  const params = await searchParams
  const searchTerm = params?.search?.toLowerCase() || ""
  const categoryFilter = params?.category || ""
  
  const filteredCompetencies = competencies.filter(comp => {
    const matchesSearch = 
      !searchTerm || 
      comp.competenceType.name.toLowerCase().includes(searchTerm) ||
      comp.competenceType.category.toLowerCase().includes(searchTerm) ||
      (comp.notes && comp.notes.toLowerCase().includes(searchTerm))
    
    const matchesCategory = 
      !categoryFilter || 
      comp.competenceType.category === categoryFilter
    
    return matchesSearch && matchesCategory
  })
  
  // Grupper kompetanser etter kategori for visning
  const groupedCompetencies = groupByCategory(filteredCompetencies)
  
  // Få en liste av unike kategorier for filteret
  const categories = [...new Set(competencies.map(comp => comp.competenceType.category))]
    .sort((a, b) => a.localeCompare(b))
  
  // Beregn statistikk
  const stats = {
    total: competencies.length,
    verified: competencies.filter(c => c.verificationStatus === 'VERIFIED').length,
    pending: competencies.filter(c => c.verificationStatus === 'PENDING').length,
    expired: competencies.filter(c => {
      if (!c.expiryDate) return false
      return new Date(c.expiryDate) < new Date()
    }).length,
    expiringSoon: competencies.filter(c => {
      if (!c.expiryDate) return false
      const daysUntil = getDaysUntil(c.expiryDate)
      return daysUntil > 0 && daysUntil <= 90
    }).length
  }
  
  // Hent utløpte og snart utløpende kompetanser for varsler
  const expiredCompetencies = competencies.filter(c => {
    if (!c.expiryDate) return false
    return new Date(c.expiryDate) < new Date()
  })
  
  const expiringCompetencies = competencies.filter(c => {
    if (!c.expiryDate) return false
    const daysUntil = getDaysUntil(c.expiryDate)
    return daysUntil > 0 && daysUntil <= 90
  })
  
  // Finn uregistrerte kompetansetyper (de som finnes i bedriften men som brukeren ikke har)
  const allCompetenceTypes = await prisma.competenceType.findMany({
    where: {
      companyId: session.user.companyId,
      isActive: true
    }
  })
  
  const userCompetenceTypeIds = new Set(competencies.map(c => c.competenceTypeId))
  const missingCompetenceTypes = allCompetenceTypes.filter(type => !userCompetenceTypeIds.has(type.id))
  
  return (
    <div className="space-y-4 p-4 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="space-y-0.5">
          <Button 
            variant="outline" 
            size="sm" 
            className="mb-2 h-8 w-fit" 
            asChild
          >
            <Link href="/employee-dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Tilbake til dashbordet
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Award className="h-6 w-6 text-muted-foreground" />
            <h2 className="text-xl font-bold tracking-tight">Mine kompetanser</h2>
          </div>
          <p className="text-muted-foreground text-sm">
            Administrer dine kompetanser og sertifikater
          </p>
        </div>
        <Button asChild className="gap-1.5 w-full sm:w-auto">
          <Link href="/employee/competence/add">
            <PlusCircle className="h-4 w-4" />
            Legg til kompetanse
          </Link>
        </Button>
      </div>
      <Separator />
      
      {/* Statistikkoversikt og varsler */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Card className="bg-primary/5">
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-sm flex items-center gap-1.5">
              <Award className="h-4 w-4" />
              Totalt
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Registrert</p>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50">
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-sm flex items-center gap-1.5 text-green-800">
              <Check className="h-4 w-4" />
              Verifisert
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-xl font-bold text-green-700">{stats.verified}</div>
            <p className="text-xs text-green-600">Godkjent</p>
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-50">
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-sm flex items-center gap-1.5 text-yellow-800">
              <Clock className="h-4 w-4" />
              Venter
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-xl font-bold text-yellow-700">{stats.pending}</div>
            <p className="text-xs text-yellow-600">Til verifisering</p>
          </CardContent>
        </Card>
        
        <Card className="bg-red-50">
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-sm flex items-center gap-1.5 text-red-800">
              <AlertCircle className="h-4 w-4" />
              Utløpt
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-xl font-bold text-red-700">{stats.expired + stats.expiringSoon}</div>
            <p className="text-xs text-red-600">Trenger fornyelse</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Advarsler om utløpte/utløpende kompetanser - mer kompakt for mobil */}
      {(expiredCompetencies.length > 0 || expiringCompetencies.length > 0) && (
        <div className="space-y-2">
          {expiredCompetencies.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-red-800 text-sm">
                    {expiredCompetencies.length} utløpte kompetanser
                  </h3>
                  <details className="text-red-700 text-xs mt-1">
                    <summary className="cursor-pointer">Vis detaljer</summary>
                    <ul className="mt-1 space-y-1 pl-4 list-disc">
                      {expiredCompetencies.map(comp => (
                        <li key={comp.id}>
                          {comp.competenceType.name} 
                          {comp.expiryDate && (
                            <span> (utløpt {formatDate(comp.expiryDate)})</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </details>
                </div>
              </div>
            </div>
          )}
          
          {expiringCompetencies.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex gap-2">
                <Clock className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-orange-800 text-sm">
                    {expiringCompetencies.length} kompetanser som snart utløper
                  </h3>
                  <details className="text-orange-700 text-xs mt-1">
                    <summary className="cursor-pointer">Vis detaljer</summary>
                    <ul className="mt-1 space-y-1 pl-4 list-disc">
                      {expiringCompetencies.map(comp => {
                        const daysUntil = getDaysUntil(comp.expiryDate)
                        return (
                          <li key={comp.id}>
                            {comp.competenceType.name} 
                            {comp.expiryDate && (
                              <span> ({daysUntil} dager igjen, utløper {formatDate(comp.expiryDate)})</span>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  </details>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Søke- og filterfelt */}
      <SearchAndFilter 
        defaultSearch={searchParams?.search} 
        categories={categories}
        defaultCategory={searchParams?.category}
      />
      
      <Tabs defaultValue="all">
        <TabsList className="grid grid-cols-3 w-[300px]">
          <TabsTrigger value="all">Alle</TabsTrigger>
          <TabsTrigger value="active">Aktive</TabsTrigger>
          <TabsTrigger value="expired">Utløpt/Snart</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-6 mt-6">
          {Object.keys(groupedCompetencies).length === 0 ? (
            <div className="text-center py-12 border rounded-md bg-muted/10">
              <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              {searchTerm || categoryFilter ? (
                <>
                  <h3 className="text-xl font-medium mb-2">Ingen resultater funnet</h3>
                  <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                    Ingen kompetanser matcher ditt søk eller filter. Prøv et annet søkeord eller fjern filteret.
                  </p>
                  <Button asChild variant="outline">
                    <Link href="/employee/competence">
                      Fjern alle filtre
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-medium mb-2">Ingen kompetanser registrert</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Du har ingen registrerte kompetanser eller sertifiseringer. Legg til din første kompetanse for å komme i gang.
                  </p>
                  <Button asChild>
                    <Link href="/employee/competence/add">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Legg til kompetanse
                    </Link>
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedCompetencies).map(([category, competencies]) => (
                <div key={category} className="space-y-4">
                  <h3 className="text-lg font-semibold">{category}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {competencies.map((comp) => {
                      // Beregn status og visuell stil
                      let statusBadge;
                      let statusColor = "";
                      
                      if (comp.verificationStatus === 'PENDING') {
                        statusBadge = <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Venter på godkjenning</Badge>
                        statusColor = "border-yellow-200"
                      } else if (comp.verificationStatus === 'REJECTED') {
                        statusBadge = <Badge className="bg-red-100 text-red-800 border-red-200">Avvist</Badge>
                        statusColor = "border-red-200"
                      } else if (comp.expiryDate && new Date(comp.expiryDate) < new Date()) {
                        statusBadge = <Badge className="bg-red-100 text-red-800 border-red-200">Utløpt</Badge>
                        statusColor = "border-red-200"
                      } else if (comp.expiryDate) {
                        const daysUntil = getDaysUntil(comp.expiryDate)
                        if (daysUntil <= 30) {
                          statusBadge = <Badge className="bg-red-100 text-red-800 border-red-200">{daysUntil} dager igjen</Badge>
                          statusColor = "border-red-200"
                        } else if (daysUntil <= 90) {
                          statusBadge = <Badge className="bg-orange-100 text-orange-800 border-orange-200">{daysUntil} dager igjen</Badge>
                          statusColor = "border-orange-200"
                        } else {
                          statusBadge = <Badge className="bg-green-100 text-green-800 border-green-200">Gyldig</Badge>
                          statusColor = "border-green-200"
                        }
                      } else {
                        statusBadge = <Badge className="bg-green-100 text-green-800 border-green-200">Utløper ikke</Badge>
                        statusColor = "border-green-200"
                      }
                      
                      return (
                        <Card key={comp.id} className={`hover:shadow-md transition-shadow ${statusColor}`}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">{comp.competenceType.name}</CardTitle>
                            <CardDescription>
                              {comp.notes ? comp.notes.substring(0, 60) + (comp.notes.length > 60 ? '...' : '') : 'Ingen beskrivelse'}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>Oppnådd: {formatDate(comp.achievedDate)}</span>
                              </div>
                              {statusBadge}
                            </div>
                            
                            {comp.expiryDate && (
                              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>Utløper: {formatDate(comp.expiryDate)}</span>
                              </div>
                            )}
                          </CardContent>
                          <CardFooter className="pt-0">
                            <div className="flex gap-2 w-full">
                              <Button asChild variant="outline" className="flex-1" size="sm">
                                <Link href={`/employee/competence/details/${comp.id}`}>
                                  Se detaljer
                                </Link>
                              </Button>
                              
                              {comp.expiryDate && new Date(comp.expiryDate) < new Date(new Date().setMonth(new Date().getMonth() + 6)) && (
                                <Button asChild variant="default" className="flex-1" size="sm">
                                  <Link href={`/employee/competence/renew/${comp.id}`}>
                                    Forny
                                  </Link>
                                </Button>
                              )}
                            </div>
                          </CardFooter>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="active" className="space-y-6 mt-6">
          {/* Aktive kompetanser (bare de som er verifisert og ikke utløpt) */}
          {competencies.filter(c => 
            c.verificationStatus === 'VERIFIED' && 
            (!c.expiryDate || new Date(c.expiryDate) > new Date())
          ).length === 0 ? (
            <div className="text-center py-12 border rounded-md bg-muted/10">
              <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">Ingen aktive kompetanser</h3>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                Du har ingen aktive godkjente kompetanser. Når dine kompetanser blir verifisert, vil de vises her.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {competencies
                .filter(c => 
                  c.verificationStatus === 'VERIFIED' && 
                  (!c.expiryDate || new Date(c.expiryDate) > new Date())
                )
                .map((comp) => (
                  <Card key={comp.id} className="hover:shadow-md transition-shadow border-green-200">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <CardTitle className="text-lg">{comp.competenceType.name}</CardTitle>
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          {!comp.expiryDate ? 'Utløper ikke' : 'Gyldig'}
                        </Badge>
                      </div>
                      <CardDescription>
                        {comp.competenceType.category}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Oppnådd: {formatDate(comp.achievedDate)}</span>
                      </div>
                      
                      {comp.expiryDate && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Utløper: {formatDate(comp.expiryDate)}</span>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button asChild variant="outline" className="w-full" size="sm">
                        <Link href={`/employee/competence/details/${comp.id}`}>
                          Se detaljer
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="expired" className="space-y-6 mt-6">
          {/* Utløpte og snart utløpende kompetanser */}
          {competencies.filter(c => 
            c.expiryDate && 
            (
              new Date(c.expiryDate) < new Date() || 
              getDaysUntil(c.expiryDate) <= 90
            )
          ).length === 0 ? (
            <div className="text-center py-12 border rounded-md bg-muted/10">
              <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">Ingen utløpte eller snart utløpende kompetanser</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Bra! Alle dine kompetanser er gyldige og ingen utløper de neste 3 månedene.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Utløpte */}
              {expiredCompetencies.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-red-700">Utløpte kompetanser</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {expiredCompetencies.map((comp) => (
                      <Card key={comp.id} className="hover:shadow-md transition-shadow border-red-200">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between">
                            <CardTitle className="text-lg">{comp.competenceType.name}</CardTitle>
                            <Badge className="bg-red-100 text-red-800 border-red-200">Utløpt</Badge>
                          </div>
                          <CardDescription>
                            {comp.competenceType.category}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Utløpte: {formatDate(comp.expiryDate)}</span>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button asChild className="w-full" size="sm">
                            <Link href={`/employee/competence/renew/${comp.id}`}>
                              Forny nå
                            </Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Snart utløpende */}
              {expiringCompetencies.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-orange-700">Snart utløpende kompetanser</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {expiringCompetencies.map((comp) => {
                      const daysUntil = getDaysUntil(comp.expiryDate)
                      let borderColor = "border-orange-200"
                      let badgeClass = "bg-orange-100 text-orange-800 border-orange-200"
                      
                      if (daysUntil <= 30) {
                        borderColor = "border-red-200"
                        badgeClass = "bg-red-100 text-red-800 border-red-200"
                      }
                      
                      return (
                        <Card key={comp.id} className={`hover:shadow-md transition-shadow ${borderColor}`}>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between">
                              <CardTitle className="text-lg">{comp.competenceType.name}</CardTitle>
                              <Badge className={badgeClass}>{daysUntil} dager igjen</Badge>
                            </div>
                            <CardDescription>
                              {comp.competenceType.category}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>Utløper: {formatDate(comp.expiryDate)}</span>
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Button asChild className="w-full" size="sm">
                              <Link href={`/employee/competence/renew/${comp.id}`}>
                                Forny nå
                              </Link>
                            </Button>
                          </CardFooter>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Foreslåtte kompetanser som ansatte kan registrere */}
      {missingCompetenceTypes.length > 0 && (
        <div className="space-y-4 mt-8">
          <h3 className="text-lg font-semibold">Foreslåtte kompetanser</h3>
          <p className="text-muted-foreground text-sm">
            Din bedrift har følgende kompetansetyper som du ikke har registrert ennå:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {missingCompetenceTypes.slice(0, 6).map((type) => (
              <Card key={type.id} className="hover:shadow-md transition-shadow border-dashed">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{type.name}</CardTitle>
                  <CardDescription>
                    {type.category}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {type.description || 'Ingen beskrivelse tilgjengelig'}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="outline" className="w-full" size="sm">
                    <Link href={`/employee/competence/add?type=${type.id}`}>
                      <PlusCircle className="mr-2 h-3 w-3" />
                      Legg til
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {missingCompetenceTypes.length > 6 && (
            <div className="flex justify-center mt-4">
              <Button asChild variant="link">
                <Link href="/employee/competence/add">
                  Se alle {missingCompetenceTypes.length} foreslåtte kompetanser
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}