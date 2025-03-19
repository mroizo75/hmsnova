import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Award, Calendar, Check, FileText, Info, Users, X } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { notFound } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getUserPermissions } from "@/lib/auth/permissions"
import { format } from "date-fns"
import { nb } from "date-fns/locale"
import Image from "next/image"

// Hjelpefunksjon for å vise riktig badge for status
function getStatusBadge(status: string) {
  switch (status) {
    case 'VERIFIED':
      return <Badge className="bg-green-600"><Check className="w-3 h-3 mr-1" /> Verifisert</Badge>
    case 'REJECTED':
      return <Badge variant="destructive"><X className="w-3 h-3 mr-1" /> Avvist</Badge>
    case 'PENDING':
      return <Badge variant="outline" className="text-orange-600 border-orange-600"><Info className="w-3 h-3 mr-1" /> Venter på verifisering</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

// Hjelpefunksjon for å vise riktig badge for utløp
function getExpiryBadge(expiryDate: Date | null) {
  if (!expiryDate) {
    return <Badge variant="secondary">Utløper ikke</Badge>
  }
  
  const now = new Date()
  const expiryTime = expiryDate.getTime()
  const nowTime = now.getTime()
  
  // Utløpt
  if (expiryTime < nowTime) {
    return <Badge variant="destructive">Utløpt</Badge>
  }
  
  // Utløper innen 30 dager
  const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000
  if (expiryTime - nowTime < thirtyDaysInMs) {
    return <Badge variant="destructive">Utløper snart</Badge>
  }
  
  // Utløper innen 90 dager
  const ninetyDaysInMs = 90 * 24 * 60 * 60 * 1000
  if (expiryTime - nowTime < ninetyDaysInMs) {
    return <Badge variant="warning">Utløper om mindre enn 3 måneder</Badge>
  }
  
  // Utløper senere
  return <Badge variant="outline" className="text-green-600 border-green-600">Gyldig</Badge>
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
      key: "COMPETENCE",
      isActive: true
    }
  })

  if (!competenceModule) {
    redirect('/dashboard/competence')
  }
  
  // Hent kompetanseposten
  const { id } = params
  const competence = await prisma.competence.findFirst({
    where: {
      id: id,
    },
    include: {
      user: true,
      competenceType: true,
    }
  })
  
  if (!competence) {
    notFound()
  }
  
  // Sjekk om brukeren har tilgang til denne kompetansen
  // Kun hvis det er din egen kompetanse eller du er admin/HMS-ansvarlig
  const isOwnCompetence = competence.user.id === session.user.id
  const permissions = await getUserPermissions(session.user.id)
  const isAdmin = permissions.includes("ADMIN") || permissions.includes("HMS_RESPONSIBLE")
  
  if (!isOwnCompetence && !isAdmin) {
    redirect('/dashboard/competence')
  }
  
  return (
    <div className="space-y-6 p-6 pb-16">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Award className="h-6 w-6 text-muted-foreground" />
            <h2 className="text-2xl font-bold tracking-tight">Kompetansedetaljer</h2>
          </div>
          <p className="text-muted-foreground">
            Detaljer om {competence.user.name} sin {competence.competenceType.name}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/dashboard/competence/employees/${competence.user.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tilbake til ansattoversikt
          </Link>
        </Button>
      </div>
      <Separator />
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Ansattinformasjon */}
        <Card className="md:w-1/3">
          <CardHeader>
            <CardTitle className="text-xl">Ansattinformasjon</CardTitle>
            <CardDescription>Detaljer om ansatt</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-16 w-16">
                <AvatarImage src={competence.user.image || undefined} />
                <AvatarFallback className="text-lg">{competence.user.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-lg">{competence.user.name}</p>
                <p className="text-muted-foreground text-sm">{competence.user.email}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                <div>{getStatusBadge(competence.verificationStatus)}</div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Registrert</h3>
                <p>{format(new Date(competence.createdAt), 'PPP', { locale: nb })}</p>
              </div>
              
              {competence.verifiedAt && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Verifisert</h3>
                  <p>{format(new Date(competence.verifiedAt), 'PPP', { locale: nb })}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Kompetansedetaljer */}
        <Card className="md:w-2/3">
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
                    <p className="text-sm">{competence.notes}</p>
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
            
            {isAdmin && competence.verificationStatus === 'PENDING' && (
              <div className="pt-4 border-t">
                <h3 className="font-medium mb-3">Verifiseringshandlinger</h3>
                <div className="flex gap-3">
                  <form action={`/api/dashboard/competence/${competence.id}/verify`} method="POST">
                    <input type="hidden" name="action" value="approve" />
                    <Button type="submit" className="bg-green-600 hover:bg-green-700">
                      <Check className="mr-2 h-4 w-4" />
                      Godkjenn kompetanse
                    </Button>
                  </form>
                  
                  <form action={`/api/dashboard/competence/${competence.id}/verify`} method="POST">
                    <input type="hidden" name="action" value="reject" />
                    <Button type="submit" variant="destructive">
                      <X className="mr-2 h-4 w-4" />
                      Avvis kompetanse
                    </Button>
                  </form>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 