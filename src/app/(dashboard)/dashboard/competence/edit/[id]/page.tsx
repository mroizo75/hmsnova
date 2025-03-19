import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Award, CalendarIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { notFound } from "next/navigation"
import { getUserPermissions } from "@/lib/auth/permissions"
import { format } from "date-fns"
import { nb } from "date-fns/locale"
import { CompetenceEditForm } from "./competence-edit-form"

export default async function EditCompetencePage({
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
  
  // Hent kompetansen som skal redigeres
  const { id } = params
  const competence = await prisma.competence.findFirst({
    where: {
      id: id,
      user: {
        companyId: session.user.companyId
      }
    },
    include: {
      user: true,
      competenceType: true,
    }
  })
  
  if (!competence) {
    notFound()
  }
  
  // Sjekk om brukeren har tilgang til å redigere denne kompetansen
  // Kun hvis det er din egen kompetanse eller du er admin/HMS-ansvarlig
  const isOwnCompetence = competence.user.id === session.user.id
  const permissions = await getUserPermissions(session.user.id)
  const isAdmin = permissions.includes("ADMIN") || permissions.includes("HMS_RESPONSIBLE")
  
  if (!isOwnCompetence && !isAdmin) {
    redirect('/dashboard/competence')
  }
  
  // Hent alle kompetansetyper for dropdown
  const competenceTypes = await prisma.competenceType.findMany({
    where: {
      companyId: session.user.companyId,
      isActive: true
    },
    orderBy: {
      name: 'asc'
    }
  })
  
  return (
    <div className="space-y-6 p-6 pb-16">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Award className="h-6 w-6 text-muted-foreground" />
            <h2 className="text-2xl font-bold tracking-tight">Rediger kompetanse</h2>
          </div>
          <p className="text-muted-foreground">
            Rediger detaljer for kompetanse: {competence.competenceType.name}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/dashboard/competence/details/${competence.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tilbake til detaljer
          </Link>
        </Button>
      </div>
      <Separator />
      
      <Card>
        <CardHeader>
          <CardTitle>Rediger kompetansedetaljer</CardTitle>
          <CardDescription>
            Oppdater informasjon om denne kompetansen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CompetenceEditForm 
            competence={competence} 
            competenceTypes={competenceTypes} 
            isAdmin={isAdmin} 
          />
        </CardContent>
      </Card>
    </div>
  )
} 