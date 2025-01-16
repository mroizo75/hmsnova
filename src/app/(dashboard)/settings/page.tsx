import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { redirect } from "next/navigation"
import { SettingsForm } from "./settings-form"
import prisma from "@/lib/db"

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect('/login')
  }

  // Hent eller opprett brukerinnstillinger
  const settings = await prisma.userSettings.upsert({
    where: {
      userId: session.user.id
    },
    create: {
      userId: session.user.id,
      emailNotifications: true,
      pushNotifications: true,
      dailyDigest: false,
      weeklyDigest: true
    },
    update: {}
  })

  return (
    <div className="container space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Innstillinger</h1>
        <p className="text-muted-foreground">Administrer dine personlige innstillinger</p>
      </div>
      <SettingsForm settings={settings} />
    </div>
  )
} 