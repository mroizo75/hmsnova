'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useState, Suspense, useEffect } from "react"
import { toast } from "sonner"
import Image from "next/image"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Laster innlogging...</div>}>
      <LoginFormInner />
    </Suspense>
  )
}

function LoginFormInner() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const isAdminLogin = searchParams.get('admin') === 'true'
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const error = searchParams.get('error')
  
  // Håndter feilmeldinger fra URL-parametere
  useEffect(() => {
    if (error) {
      switch (error) {
        case 'SessionExpired':
          setAuthError('Din sesjon har utløpt. Vennligst logg inn igjen.')
          break
        case 'AuthError':
          setAuthError('Det oppstod et problem med innloggingen din.')
          break
        case 'CredentialsSignin':
          setAuthError('Ugyldig e-post eller passord.')
          break
        default:
          setAuthError('Det oppstod en feil under innloggingen.')
      }
    }
  }, [error])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setAuthError(null)

    try {
      console.log("Starter innlogging med:", { email, callbackUrl });
      
      // IKKE RENS COOKIES! Det skaper problemer med NextAuth i T3 Stack
      // NextAuth håndterer cookies selv, og det å slette dem manuelt kan forårsake
      // problemer med valideringen
      
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl
      })

      console.log("SignIn resultat:", result);

      if (result?.error) {
        setAuthError("Ugyldig e-post eller passord")
        toast.error("Ugyldig innlogging")
        console.error("Innloggingsfeil:", result.error);
      } else {
        try {
          // Vent litt for å sikre at sesjonen propageres riktig
          console.log("Venter på at sesjonen skal opprettes fullt ut...");
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Bruk vår egen debug-session API istedenfor standard endpoint
          const response = await fetch('/api/auth/debug-session')
          if (!response.ok) {
            const errorData = await response.json();
            console.error("Feil fra debug-session API:", errorData);
            setAuthError("Kunne ikke hente brukerdata. Prøv å laste siden på nytt.");
            return;
          }
          
          const sessionData = await response.json()
          
          // Debug: Vis all session data for å sjekke om brukerinfo er korrekt
          console.log("Sesjonsdata ved innlogging (fra debug-session):", JSON.stringify(sessionData, null, 2));
          
          // Sjekk om vi har en feilmelding fra API-et
          if (sessionData.error) {
            console.error("Feil fra debug-session API:", sessionData.error);
            setAuthError("Kunne ikke hente brukerdata: " + sessionData.error);
            window.location.href = "/login";  // Redirect tilbake til login
            return;
          }
          
          // Sjekk om vi har en gyldig sesjon med brukerdata
          const session = sessionData.session;
          
          if (!session?.user) {
            console.error("KRITISK: Ingen bruker i session etter vellykket innlogging!");
            setAuthError("Kunne ikke hente brukerdata. Prøv igjen eller kontakt support.");
            return;
          }
          
          const userRole = session.user.role;
          console.log("Brukerrolle ved innlogging:", userRole);
          
          // Forbedret omdirigering etter login for å sikre riktig dashboard
          let redirectUrl = '/dashboard'; // Standard for COMPANY_ADMIN
          
          if (userRole === 'ADMIN' || userRole === 'SUPPORT') {
            console.log("Omdirigerer ADMIN/SUPPORT direkte til admin dashboard");
            redirectUrl = '/admin/dashboard';
            // Legg til en admin=true parameter for ekstra sikkerhet
            console.log(`Admin bruker detektert (${userRole}) - bruker admin/dashboard`);
          } else if (userRole === 'EMPLOYEE') {
            redirectUrl = '/employee-dashboard';
          } 
          // COMPANY_ADMIN går til standard /dashboard
          
          console.log(`Omdirigerer til ${redirectUrl} basert på rolle: ${userRole}`);
          
          // Bruk ren redirect med absolutt URL for å unngå problemer med relative paths
          const baseUrl = window.location.origin;
          const fullRedirectUrl = `${baseUrl}${redirectUrl}`;
          
          // Legg til admin=true for admin-brukere
          const urlParams = new URLSearchParams();
          urlParams.append('fresh', 'true');
          urlParams.append('t', Date.now().toString());
          
          if (userRole === 'ADMIN' || userRole === 'SUPPORT') {
            urlParams.append('admin', 'true');
          }
          
          // Tvungen redirect med cache-busting parameter
          window.location.href = `${fullRedirectUrl}?${urlParams.toString()}`;
          return;
        } catch (sessionError) {
          console.error('Kunne ikke hente sesjon:', sessionError);
          setAuthError("Pålogging vellykket, men kunne ikke hente brukerdata.");
          window.location.href = '/dashboard';
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      setAuthError("Kunne ikke logge inn. Vennligst prøv igjen senere.")
      toast.error("Kunne ikke logge inn")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Link href="/" className="text-2xl font-bold text-[#3F546E]">
              <Image src="/HMSNova-logo.svg" alt="HMS Nova" width={100} height={100} className="w-full h-full"/>
            </Link>
          </div>
          <CardTitle className="text-2xl text-center">
            {isAdminLogin ? "Systemadministrasjon" : "Velkommen tilbake"}
          </CardTitle>
          <CardDescription className="text-center">
            {isAdminLogin 
              ? "Logg inn på systemadministrasjonspanelet" 
              : "Logg inn på din konto for å fortsette"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {authError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Feil</AlertTitle>
              <AlertDescription>
                {authError}
              </AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="E-post"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Passord"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-[#3F546E] hover:bg-[#2C435F]"
              disabled={isLoading}
            >
              {isLoading ? "Logger inn..." : "Logg inn"}
            </Button>
          </form>
          {!isAdminLogin && (
            <>
              <div className="mt-4 text-center text-sm">
                <Link href="/forgot-password" className="text-[#3F546E] hover:underline">
                  Glemt passord?
                </Link>
              </div>
              <div className="mt-4 text-center text-sm">
                Har du ikke en konto?{" "}
                <Link href="/register" className="text-[#3F546E] hover:underline">
                  Registrer deg her
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 