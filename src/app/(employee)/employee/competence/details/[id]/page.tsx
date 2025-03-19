import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { redirect, notFound } from "next/navigation"
import prisma from "@/lib/db"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Award, Calendar, FileText } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { nb } from "date-fns/locale"

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

export default async function CompetenceDetailsPage({
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
      OR: [
        { key: "COMPETENCE", isActive: true },
        { key: "COMPETENCY", isActive: true }
      ]
    }
  })

  if (!competenceModule) {
    redirect('/employee')
  }
  
  // Hent kompetanseposten
  const { id } = params
  const competence = await prisma.competence.findFirst({
    where: {
      id: id,
      userId: session.user.id
    },
    include: {
      competenceType: true,
    }
  })
  
  if (!competence) {
    notFound()
  }
  
  return (
    <div className="space-y-4 p-4 pb-24">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Award className="h-6 w-6 text-muted-foreground" />
            <h2 className="text-xl font-bold tracking-tight">Kompetansedetaljer</h2>
          </div>
          <p className="text-muted-foreground text-sm">
            Detaljer om {competence.competenceType.name}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/employee/competence">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tilbake
          </Link>
        </Button>
      </div>
      <Separator />
      
      <div className="space-y-6">
        {/* Kompetansedetaljer */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              {competence.competenceType.name}
            </CardTitle>
            <CardDescription>
              {competence.competenceType.description || 'Ingen beskrivelse tilgjengelig'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Kategori</h3>
                  <p>{competence.competenceType.category}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                  <div>{getStatusBadge(competence.verificationStatus)}</div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Oppnådd dato</h3>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(competence.achievedDate), 'PPP', { locale: nb })}</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Utløpsdato</h3>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {competence.expiryDate ? (
                      <span>{format(new Date(competence.expiryDate), 'PPP', { locale: nb })}</span>
                    ) : (
                      <span>Utløper ikke</span>
                    )}
                  </div>
                  <div className="mt-1">{getExpiryBadge(competence.expiryDate)}</div>
                </div>
              </div>
              
              <div className="space-y-4">
                {competence.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Notater</h3>
                    <p className="text-sm whitespace-pre-wrap">{competence.notes}</p>
                  </div>
                )}
                
                {competence.certificateUrl && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Sertifikat</h3>
                    <div className="border rounded-md p-4 bg-gray-50 flex flex-col items-center">
                      <FileText className="h-12 w-12 text-blue-500 mb-2" />
                      <a 
                        href={competence.certificateUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <span>Se sertifikat</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Fornyelsesknapp hvis utløpt eller utløper snart */}
        {competence.expiryDate && new Date(competence.expiryDate) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) && (
          <div className="flex justify-center mt-8">
            <Button asChild>
              <Link href={`/employee/competence/renew/${competence.id}`}>
                Forny kompetanse
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
