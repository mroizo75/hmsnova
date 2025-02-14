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
      company: true
    }
  })

  if (!user || !user.company) {
    console.error("User or company not found:", { userId: session.user.id })
    redirect('/login')
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
    companyId: user.company.id // Dette må være definert
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