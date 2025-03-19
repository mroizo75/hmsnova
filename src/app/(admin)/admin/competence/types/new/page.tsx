import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { redirect } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { BookUser } from "lucide-react"
import { CompetenceTypeForm } from "./competence-type-form"

export default async function NewCompetenceTypePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user || !['ADMIN', 'SUPPORT', 'COMPANY_ADMIN'].includes(session.user.role)) {
    redirect('/login')
  }

  return (
    <div className="space-y-6 p-6 pb-16">
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <BookUser className="h-6 w-6 text-muted-foreground" />
          <h2 className="text-2xl font-bold tracking-tight">Ny kompetansetype</h2>
        </div>
        <p className="text-muted-foreground">
          Opprett en ny type kompetanse eller sertifisering
        </p>
      </div>
      <Separator />
      
      <div className="max-w-2xl">
        <CompetenceTypeForm />
      </div>
    </div>
  )
} 