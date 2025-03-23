import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { redirect } from "next/navigation"
import { ProfileForm } from "./profile-form"
import prisma from "@/lib/db"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      company: {
        include: {
          modules: true
        }
      },
      Competency: true
    }
  })

  if (!user || !user.company) {
    console.error("User or company not found:", { userId: session.user.id })
    redirect('/login')
  }

  // Sjekk om kompetansemodulen er aktiv
  const hasCompetencyModule = user.company.modules.some(module => 
    (module.key === 'COMPETENCY' || module.key === 'COMPETENCE') && module.isActive
  )

  // Hent kompetansetyper hvis modulen er aktiv
  let competenceTypes: any[] = []
  let formalCompetencies: any[] = []
  if (hasCompetencyModule) {
    competenceTypes = await prisma.competenceType.findMany({
      where: {
        companyId: user.company.id,
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Hent formelle kompetanser fra Competence-tabellen
    formalCompetencies = await prisma.competence.findMany({
      where: {
        userId: user.id
      },
      include: {
        competenceType: true
      }
    })
  }

  // Strukturer data riktig før vi sender til client
  const userData = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    image: user.image,
    address: user.address,
    certifications: user.certifications,
    competencies: hasCompetencyModule ? user.Competency : [],
    formalCompetencies: hasCompetencyModule ? formalCompetencies : [],
    companyId: user.company.id,
    hasCompetencyModule,
    competenceTypes: hasCompetencyModule ? competenceTypes : []
  }

  console.log("Sending user data to client:", {
    userId: userData.id,
    companyId: userData.companyId
  })

  return (
    <div className="container space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Min profil</h1>
        <p className="text-muted-foreground">Administrer din profilinformasjon</p>
      </div>
      <ProfileForm user={userData as any} />
    </div>
  )
} 