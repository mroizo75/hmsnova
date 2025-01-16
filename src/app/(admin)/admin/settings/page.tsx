import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { redirect } from "next/navigation"
import { SettingsForm } from "./settings-form"
import prisma from "@/lib/db"
import { Separator } from "@/components/ui/separator"
import { Settings } from "lucide-react"

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true
    }
  })

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="space-y-6 p-6 pb-16">
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6 text-muted-foreground" />
          <h2 className="text-2xl font-bold tracking-tight">Innstillinger</h2>
        </div>
        <p className="text-muted-foreground">
          Administrer din profil og kontoinnstillinger
        </p>
      </div>
      <Separator />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Profilinformasjon</h3>
            <p className="text-sm text-muted-foreground">
              Oppdater din personlige informasjon og hvordan den vises
            </p>
          </div>
          <SettingsForm user={user} />
        </div>
        <div className="space-y-6">
          <div className="rounded-lg border p-4">
            <h4 className="text-sm font-medium mb-2">Tips for sikkerhet</h4>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Bruk et sterkt passord med minst 8 tegn</li>
              <li>• Inkluder tall og spesialtegn i passordet</li>
              <li>• Ikke del påloggingsinformasjonen din med andre</li>
              <li>• Aktiver to-faktor autentisering for ekstra sikkerhet</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 