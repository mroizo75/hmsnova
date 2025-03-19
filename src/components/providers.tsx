"use client"

import { ThemeProvider } from "next-themes"
import { SessionProvider } from "next-auth/react"
import { useSession, signOut, signIn } from "next-auth/react"
import { useEffect, useState, Suspense } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { toast, Toaster } from "sonner"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

interface ProvidersProps {
  children: React.ReactNode
}

// AuthProvider som håndterer utløpte tokens og andre autentiseringsproblemer
function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  
  // Håndter autentiseringsfeil
  useEffect(() => {
    if (error) {
      if (error === 'SessionExpired') {
        toast.error("Økten din har utløpt. Vennligst logg inn igjen.")
      } else if (error === 'AuthError') {
        toast.error("Det oppstod et problem med innloggingen din.")
      }
    }
  }, [error])
  
  // Fornying av token
  useEffect(() => {
    if (status === 'authenticated') {
      // Sett en timer for å sjekke token hver 5. minutt
      const interval = setInterval(async () => {
        try {
          // Polling for å sjekke token-status
          const response = await fetch('/api/auth/session')
          const data = await response.json()
          
          // Hvis token er utløpt eller snart utløper
          if (!data || !data.user) {
            // Ved tokenutløp, logg ut brukeren og omdiriger
            toast.error("Økten din har utløpt. Vennligst logg inn igjen.")
            
            await signOut({ 
              redirect: true, 
              callbackUrl: `/login?callbackUrl=${encodeURIComponent(pathname)}`
            })
          } else {
            // Oppdater sesjon for å fornye token
            await update()
          }
        } catch (error) {
          console.error("Feil ved sjekk av token-status:", error)
        }
      }, 5 * 60 * 1000) // Sjekk hvert 5. minutt
      
      return () => clearInterval(interval)
    }
  }, [status, pathname, update])
  
  return <>{children}</>
}

function ProvidersInner({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60,
        gcTime: 1000 * 60 * 2,
        refetchOnWindowFocus: true,
        retry: 1,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
        >
          <AuthProvider>
            {children}
            <Toaster position="top-right" closeButton />
          </AuthProvider>
        </ThemeProvider>
      </SessionProvider>
    </QueryClientProvider>
  )
}

export function Providers({ children }: ProvidersProps) {
  return (
    <Suspense fallback={<div>Laster...</div>}>
      <ProvidersInner>{children}</ProvidersInner>
    </Suspense>
  )
} 