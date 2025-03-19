import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, CheckCircle, Clock, ExternalLink, Eye, ThumbsDown, ThumbsUp } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export default async function VerifyCompetencePage() {
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

  // Hent kompetanser som venter på verifisering
  const pendingCompetencies = await prisma.competence.findMany({
    where: {
      user: { companyId: session.user.companyId },
      verificationStatus: 'PENDING'
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      competenceType: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="space-y-6 p-6 pb-16">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Clock className="h-6 w-6 text-muted-foreground" />
            <h2 className="text-2xl font-bold tracking-tight">Verifiser kompetansebevis</h2>
          </div>
          <p className="text-muted-foreground">
            Godkjenn eller avvis kompetansebevis som venter på verifisering
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
      
      {pendingCompetencies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-xl font-medium mb-2">Ingen kompetansebevis venter på verifisering</h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            Alle kompetansebevis er verifisert. Nye kompetansebevis vil dukke opp her når de registreres.
          </p>
          <Button asChild variant="outline">
            <Link href="/dashboard/competence">
              Tilbake til oversikt
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {pendingCompetencies.map((competence) => (
            <Card key={competence.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{competence.competenceType.name}</CardTitle>
                    <CardDescription>
                      {competence.competenceType.category}
                      {competence.competenceType.subcategory && ` - ${competence.competenceType.subcategory}`}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-yellow-50">Venter</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Ansatt</p>
                    <p>{competence.user.name}</p>
                    <p className="text-sm text-muted-foreground">{competence.user.email}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Oppnådd dato</p>
                      <p>{formatDate(competence.achievedDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Utløpsdato</p>
                      <p>{formatDate(competence.expiryDate)}</p>
                    </div>
                  </div>
                  
                  {competence.notes && (
                    <div>
                      <p className="text-sm font-medium">Notater</p>
                      <p className="text-sm">{competence.notes}</p>
                    </div>
                  )}
                  
                  {competence.certificateUrl && (
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <a href={competence.certificateUrl} target="_blank" rel="noopener noreferrer">
                        <Eye className="mr-2 h-4 w-4" />
                        Vis sertifikat
                        <ExternalLink className="ml-2 h-3 w-3" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" className="w-1/2 mr-2">
                  <form action={`/api/dashboard/competence/${competence.id}/verify`} method="POST">
                    <input type="hidden" name="action" value="reject" />
                    <button type="submit" className="flex items-center w-full">
                      <ThumbsDown className="mr-2 h-4 w-4" />
                      Avvis
                    </button>
                  </form>
                </Button>
                <Button className="w-1/2 ml-2">
                  <form action={`/api/dashboard/competence/${competence.id}/verify`} method="POST">
                    <input type="hidden" name="action" value="approve" />
                    <button type="submit" className="flex items-center w-full">
                      <ThumbsUp className="mr-2 h-4 w-4" />
                      Godkjenn
                    </button>
                  </form>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 