import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { redirect } from "next/navigation"
import { ProfileForm } from "./profile-form"
import prisma from "@/lib/db"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id
    },
    select: {
      name: true,
      email: true,
      phone: true,
      image: true,
      address: true
    }
  })

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="container space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Min profil</h1>
        <p className="text-muted-foreground">Administrer din profilinformasjon</p>
      </div>
      <ProfileForm user={user} />
    </div>
  )
} 