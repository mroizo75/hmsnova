import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, ArrowLeft, Download, Filter } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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

export default async function ExpiringCompetencePage({
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

  // Hent filtreringsparametere
  const timeframe = typeof searchParams.timeframe === 'string' ? searchParams.timeframe : '3'
  const category = typeof searchParams.category === 'string' ? searchParams.category : 'all'

  // Hent alle utløpende kompetanser basert på filtre
  const expiringCompetencies = await getExpiringCompetencies(
    session.user.companyId,
    parseInt(timeframe),
    category !== 'all' ? category : undefined
  )

  // Hent alle kategorier for filtrering
  const categories = await prisma.competenceType.findMany({
    where: { companyId: session.user.companyId },
    select: { category: true },
    distinct: ['category']
  })

  return (
    <div className="space-y-6 p-6 pb-16">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-orange-500" />
            <h2 className="text-2xl font-bold tracking-tight">Utløpende kompetansebevis</h2>
          </div>
          <p className="text-muted-foreground">
            Oversikt over kompetansebevis som utløper innen valgt tidsperiode
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
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtrer:</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Tidsperiode:</span>
              <Select defaultValue={timeframe}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Velg tidsperiode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 måned</SelectItem>
                  <SelectItem value="3">3 måneder</SelectItem>
                  <SelectItem value="6">6 måneder</SelectItem>
                  <SelectItem value="12">12 måneder</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Kategori:</span>
              <Select defaultValue={category}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Velg kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle kategorier</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.category} value={cat.category}>
                      {cat.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button className="ml-auto" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Eksporter til Excel
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabell med utløpende kompetanser */}
      {expiringCompetencies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">Ingen utløpende kompetansebevis funnet</h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            Det er ingen kompetansebevis som utløper innen den valgte tidsperioden med de valgte filtrene.
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ansatt</TableHead>
                <TableHead>Kompetansetype</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Oppnådd dato</TableHead>
                <TableHead>Utløpsdato</TableHead>
                <TableHead>Dager igjen</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expiringCompetencies.map((comp) => {
                const daysLeft = getDaysUntil(comp.expiryDate)
                return (
                  <TableRow key={comp.id}>
                    <TableCell className="font-medium">{comp.user.name}</TableCell>
                    <TableCell>{comp.competenceType.name}</TableCell>
                    <TableCell>{comp.competenceType.category}</TableCell>
                    <TableCell>{formatDate(comp.achievedDate)}</TableCell>
                    <TableCell className={daysLeft < 30 ? 'text-red-600 font-medium' : 'text-orange-600'}>
                      {formatDate(comp.expiryDate)}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        daysLeft < 30 
                          ? 'bg-red-100 text-red-800' 
                          : daysLeft < 60
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {daysLeft} dager
                      </span>
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

// Funksjon for å hente utløpende kompetanser
async function getExpiringCompetencies(
  companyId: string, 
  months: number = 3,
  category?: string
) {
  const now = new Date()
  const futureDate = new Date(now)
  futureDate.setMonth(now.getMonth() + months)

  return await prisma.competence.findMany({
    where: {
      user: { companyId },
      expiryDate: {
        gte: now,
        lte: futureDate
      },
      ...(category ? { competenceType: { category } } : {})
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          department: true
        }
      },
      competenceType: {
        select: {
          id: true,
          name: true,
          category: true,
          subcategory: true
        }
      }
    },
    orderBy: {
      expiryDate: 'asc'
    }
  })
}

// Hjelpefunksjon for å beregne dager til utløp
function getDaysUntil(date: Date | null): number {
  if (!date) return 0
  const now = new Date()
  const expiryDate = new Date(date)
  const diffTime = expiryDate.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
} 