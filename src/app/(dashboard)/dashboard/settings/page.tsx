import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChangePasswordForm } from "@/components/settings/change-password-form"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Innstillinger</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Endre passord</CardTitle>
            <CardDescription>
              Endre ditt innloggingspassord. Vi anbefaler å bruke et sterkt passord.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 