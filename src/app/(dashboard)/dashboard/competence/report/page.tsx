import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Download, Filter } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export default async function CompetenceReportPage({
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

  // Hent filtreringsparametre på riktig måte i Next.js 15
  const params = await searchParams
  const employeeId = typeof params.employeeId === 'string' ? params.employeeId : undefined
  const competenceTypeId = typeof params.competenceTypeId === 'string' ? params.competenceTypeId : undefined
  const category = typeof params.category === 'string' ? params.category : undefined
  const status = typeof params.status === 'string' ? params.status : undefined
  const expiryStatus = typeof params.expiryStatus === 'string' ? params.expiryStatus : undefined

  // Bygg opp where-objektet basert på filtrene
  const where: any = {
    user: {
      companyId: session.user.companyId
    }
  }
  
  if (employeeId) {
    where.userId = employeeId
  }
  
  if (competenceTypeId) {
    where.competenceTypeId = competenceTypeId
  }
  
  if (status) {
    where.verificationStatus = status
  }
  
  if (category) {
    where.competenceType = {
      category
    }
  }
  
  if (expiryStatus) {
    const now = new Date()
    
    if (expiryStatus === 'expired') {
      where.expiryDate = {
        lt: now
      }
    } else if (expiryStatus === 'expiringSoon') {
      const threeMonthsFromNow = new Date(now)
      threeMonthsFromNow.setMonth(now.getMonth() + 3)
      
      where.expiryDate = {
        gte: now,
        lte: threeMonthsFromNow
      }
    } else if (expiryStatus === 'valid') {
      where.expiryDate = {
        gt: now
      }
    } else if (expiryStatus === 'noExpiry') {
      where.expiryDate = null
    }
  }
  
  // Hent kompetansedata basert på filtre
  const competencies = await prisma.competence.findMany({
    where,
    include: {
      user: true,
      competenceType: true
    },
    orderBy: [
      { expiryDate: 'asc' }
    ]
  })
  
  // Berikelse av resultater for visning og filtrering
  const enhancedCompetencies = competencies.map(competence => {
    // Beregn om kompetansen er utløpt eller utløper snart
    const now = new Date()
    let expiryStatus = 'valid'
    
    if (!competence.expiryDate) {
      expiryStatus = 'noExpiry'
    } else if (competence.expiryDate < now) {
      expiryStatus = 'expired'
    } else {
      const threeMonthsFromNow = new Date(now)
      threeMonthsFromNow.setMonth(now.getMonth() + 3)
      
      if (competence.expiryDate < threeMonthsFromNow) {
        expiryStatus = 'expiringSoon'
      }
    }
    
    // Hent department og position fra metadata (ikke direkte felt)
    const userMetadata = competence.user.metadata as Record<string, any> || {}
    const department = userMetadata.department || 'Ikke angitt'
    const position = userMetadata.position || 'Ikke angitt'
    
    return {
      ...competence,
      expiryStatus,
      // Legg til department og position som ekstra felt
      department,
      position
    }
  })
  
  // Hent filtrerings-options for dropdown-menyer
  const employees = await prisma.user.findMany({
    where: {
      companyId: session.user.companyId,
      isActive: true
    },
    orderBy: {
      name: 'asc'
    }
  })
  
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
  
  // Aggregater kategori-filtrering
  const categories = [...new Set(competenceTypes.map(type => type.category))].sort()
  
  // Beregn statistikk
  const stats = {
    total: enhancedCompetencies.length,
    verified: enhancedCompetencies.filter(c => c.verificationStatus === 'VERIFIED').length,
    pending: enhancedCompetencies.filter(c => c.verificationStatus === 'PENDING').length,
    rejected: enhancedCompetencies.filter(c => c.verificationStatus === 'REJECTED').length,
    expired: enhancedCompetencies.filter(c => c.expiryStatus === 'expired').length,
    expiringSoon: enhancedCompetencies.filter(c => c.expiryStatus === 'expiringSoon').length,
  }

  return (
    <div className="space-y-6 p-6 pb-16">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Download className="h-6 w-6 text-muted-foreground" />
            <h2 className="text-2xl font-bold tracking-tight">Kompetanserapport</h2>
          </div>
          <p className="text-muted-foreground">
            Generer og eksporter rapporter om kompetanse og sertifiseringer
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
      
      {/* Filtreringsalternativer */}
      <Card>
        <CardHeader>
          <CardTitle>Filtrer rapport</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employeeId">Ansatt</Label>
                <Select name="employeeId" defaultValue={employeeId}>
                  <SelectTrigger id="employeeId">
                    <SelectValue placeholder="Velg ansatt" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="competenceTypeId">Kompetansetype</Label>
                <Select name="competenceTypeId" defaultValue={competenceTypeId}>
                  <SelectTrigger id="competenceTypeId">
                    <SelectValue placeholder="Velg kompetansetype" />
                  </SelectTrigger>
                  <SelectContent>
                    {competenceTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Kategori</Label>
                <Select name="category" defaultValue={category}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Velg kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle kategorier</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Verifiseringsstatus</Label>
                <Select name="status" defaultValue={status}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Velg status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle statuser</SelectItem>
                    <SelectItem value="VERIFIED">Verifisert</SelectItem>
                    <SelectItem value="PENDING">Venter på godkjenning</SelectItem>
                    <SelectItem value="REJECTED">Avvist</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expiryStatus">Utløpsstatus</Label>
                <Select name="expiryStatus" defaultValue={expiryStatus}>
                  <SelectTrigger id="expiryStatus">
                    <SelectValue placeholder="Velg utløpsstatus" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle</SelectItem>
                    <SelectItem value="valid">Gyldige</SelectItem>
                    <SelectItem value="expiringSoon">Utløper snart</SelectItem>
                    <SelectItem value="expired">Utløpt</SelectItem>
                    <SelectItem value="noExpiry">Ingen utløpsdato</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center justify-between border-t pt-4 mt-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Vis kolonner</p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="col-user" defaultChecked />
                    <Label htmlFor="col-user">Ansatt</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="col-email" defaultChecked />
                    <Label htmlFor="col-email">E-post</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="col-dep" defaultChecked />
                    <Label htmlFor="col-dep">Avdeling</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="col-pos" defaultChecked />
                    <Label htmlFor="col-pos">Stilling</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="col-type" defaultChecked />
                    <Label htmlFor="col-type">Kompetansetype</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="col-cat" defaultChecked />
                    <Label htmlFor="col-cat">Kategori</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="col-achieved" defaultChecked />
                    <Label htmlFor="col-achieved">Oppnådd dato</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="col-expiry" defaultChecked />
                    <Label htmlFor="col-expiry">Utløpsdato</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="col-status" defaultChecked />
                    <Label htmlFor="col-status">Status</Label>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtrer
                </Button>
                <Button variant="outline" type="button">
                  <Download className="mr-2 h-4 w-4" />
                  Eksporter til Excel
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {/* Oppsummering */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Totalt</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
            <p className="text-xs text-muted-foreground">Verifisert</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Venter</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground">Avvist</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
            <p className="text-xs text-muted-foreground">Utløpt</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">{stats.expiringSoon}</div>
            <p className="text-xs text-muted-foreground">Utløper snart</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabell med kompetansedata */}
      {enhancedCompetencies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Download className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">Ingen data funnet</h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            Det er ingen data som matcher dine filtreringskriterier. Prøv å endre filtrene for å se flere resultater.
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ansatt</TableHead>
                <TableHead>E-post</TableHead>
                <TableHead>Avdeling</TableHead>
                <TableHead>Kompetansetype</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Oppnådd dato</TableHead>
                <TableHead>Utløpsdato</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enhancedCompetencies.map((comp) => {
                const isExpired = comp.expiryDate && comp.expiryDate < new Date()
                const isExpiringSoon = comp.expiryDate && !isExpired && (() => {
                  const threeMonthsFromNow = new Date()
                  threeMonthsFromNow.setMonth(new Date().getMonth() + 3)
                  return comp.expiryDate < threeMonthsFromNow
                })()
                
                return (
                  <TableRow key={comp.id}>
                    <TableCell className="font-medium">{comp.user.name}</TableCell>
                    <TableCell>{comp.user.email}</TableCell>
                    <TableCell>{comp.department}</TableCell>
                    <TableCell>{comp.competenceType.name}</TableCell>
                    <TableCell>{comp.competenceType.category}</TableCell>
                    <TableCell>{formatDate(comp.achievedDate)}</TableCell>
                    <TableCell className={
                      isExpired ? 'text-red-600 font-medium' : 
                      isExpiringSoon ? 'text-orange-600' : ''
                    }>
                      {formatDate(comp.expiryDate)}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        comp.verificationStatus === 'VERIFIED' 
                          ? 'bg-green-100 text-green-800' 
                          : comp.verificationStatus === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {comp.verificationStatus === 'VERIFIED' 
                          ? 'Verifisert' 
                          : comp.verificationStatus === 'REJECTED'
                          ? 'Avvist'
                          : 'Venter på godkjenning'}
                      </span>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
} 