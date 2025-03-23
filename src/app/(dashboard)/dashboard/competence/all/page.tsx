import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { Separator } from "@/components/ui/separator"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import { nb } from "date-fns/locale"
import { Award, Calendar, FileText, Trash2, Eye, ArrowLeft, Download } from "lucide-react"
import { DeleteCompetenceButton } from "./delete-competence-button"
import Link from "next/link"
import { ExportToExcelButton } from "./export-button"

// Hjelpefunksjon for status badge
function getStatusBadge(status: string) {
  switch (status) {
    case "VERIFIED":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Verifisert</Badge>
    case "REJECTED":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Avvist</Badge>
    case "PENDING":
    default:
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Venter på godkjenning</Badge>
  }
}

// Hjelpefunksjon for utløpdato badge
function getExpiryBadge(expiryDate: Date | null) {
  if (!expiryDate) return null
  
  const now = new Date()
  const expiry = new Date(expiryDate)
  
  // Utløpt
  if (expiry < now) {
    return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Utløpt</Badge>
  }
  
  // Utløper snart (innen 3 måneder)
  const threeMonthsFromNow = new Date()
  threeMonthsFromNow.setMonth(now.getMonth() + 3)
  
  if (expiry < threeMonthsFromNow) {
    return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Utløper snart</Badge>
  }
  
  return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Gyldig</Badge>
}

export default async function AllCompetencePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect('/login')
  }
  
  // Sjekk om kompetansemodulen er aktivert for bedriften
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
    redirect('/dashboard')
  }
  
  // Hent alle kompetanser for bedriften
  const competencies = await prisma.competence.findMany({
    where: {
      user: {
        companyId: session.user.companyId
      }
    },
    include: {
      user: true,
      competenceType: true,
    },
    orderBy: [
      { verificationStatus: 'asc' },
      { expiryDate: 'asc' }
    ]
  })
  
  // Beregn statistikk
  const stats = {
    total: competencies.length,
    verified: competencies.filter(c => c.verificationStatus === 'VERIFIED').length,
    pending: competencies.filter(c => c.verificationStatus === 'PENDING').length,
    rejected: competencies.filter(c => c.verificationStatus === 'REJECTED').length,
    expired: competencies.filter(c => {
      if (!c.expiryDate) return false
      return new Date(c.expiryDate) < new Date()
    }).length,
    expiringSoon: competencies.filter(c => {
      if (!c.expiryDate) return false
      const daysUntil = Math.ceil((new Date(c.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      return daysUntil > 0 && daysUntil <= 90
    }).length
  }
  
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Award className="h-6 w-6 text-muted-foreground" />
            <h2 className="text-2xl font-bold tracking-tight">Alle kompetanser</h2>
          </div>
          <p className="text-muted-foreground">
            Oversikt over alle kompetanser og sertifiseringer i bedriften
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportToExcelButton />
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/competence">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Tilbake til oversikt
            </Link>
          </Button>
        </div>
      </div>
      <Separator />
      
      {/* Statistikkoversikt */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totalt</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Registrerte kompetanser</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verifisert</CardTitle>
            <Award className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
            <p className="text-xs text-muted-foreground">Godkjente kompetanser</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Venter</CardTitle>
            <Award className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Til godkjenning</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avvist</CardTitle>
            <Award className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground">Avviste kompetanser</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utløper snart</CardTitle>
            <Calendar className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.expiringSoon}</div>
            <p className="text-xs text-muted-foreground">Innen 3 måneder</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Kompetansetabell */}
      <Card>
        <CardHeader>
          <CardTitle>Kompetanseoversikt</CardTitle>
          <CardDescription>
            Liste over alle kompetanser og sertifiseringer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ansatt</TableHead>
                <TableHead>Kompetanse</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Oppnådd</TableHead>
                <TableHead>Utløper</TableHead>
                <TableHead>Sertifikat</TableHead>
                <TableHead className="w-[100px]">Handling</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {competencies.map((competence) => (
                <TableRow key={competence.id}>
                  <TableCell className="font-medium">{competence.user.name}</TableCell>
                  <TableCell>{competence.competenceType.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(competence.verificationStatus)}
                      {getExpiryBadge(competence.expiryDate)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(competence.achievedDate), 'PPP', { locale: nb })}
                  </TableCell>
                  <TableCell>
                    {competence.expiryDate ? (
                      format(new Date(competence.expiryDate), 'PPP', { locale: nb })
                    ) : (
                      'Utløper ikke'
                    )}
                  </TableCell>
                  <TableCell>
                    {competence.certificateUrl ? (
                      <a 
                        href={competence.certificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <FileText className="h-4 w-4" />
                        Se sertifikat
                      </a>
                    ) : (
                      <span className="text-muted-foreground">Ingen sertifikat</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-100"
                        asChild
                      >
                        <Link href={`/dashboard/competence/edit/${competence.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <DeleteCompetenceButton competenceId={competence.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}