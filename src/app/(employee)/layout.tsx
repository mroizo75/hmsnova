'use client'

import { 
  BookOpen, 
  FileText, 
  AlertTriangle,
  FileBox,
  TestTube,
  ClipboardCheck,
  Award,
  AwardIcon,
  Home
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useEffect, useState } from "react"
import { io } from "socket.io-client"
import { useSession } from "next-auth/react"

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [activeModules, setActiveModules] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(true)

  // Sjekk om brukeren er autorisert til å se employee dashboard
  useEffect(() => {
    if (status === "authenticated") {
      // Når sesjonen er lastet, sjekk om brukeren er ansatt
      if (session?.user?.role !== 'EMPLOYEE') {
        console.log(`Client-side (employee) layout: Uautorisert rolle ${session?.user?.role}, omdirigerer til dashboard`);
        setIsAuthorized(false);
        
        // Bruk absolutt URL med cache-busting for å sikre riktig omdirigering
        const baseUrl = window.location.origin;
        window.location.href = `${baseUrl}/dashboard?from=employee_layout&t=${Date.now()}`;
      } else {
        console.log(`Client-side (employee) layout: Autorisert rolle EMPLOYEE, viser dashboard`);
      }
    }
  }, [session, status, router]);

  // Hent aktive moduler når komponenten lastes
  useEffect(() => {
    // FJERNER ROLLE-SJEKKEN for å bryte den endeløse omdirigeringssløyfen
    // Server-side og middleware vil håndtere tilgangskontroll
    
    const fetchModules = async () => {
      try {
        const res = await fetch('/api/user/modules')
        const data = await res.json()
        const modules: Record<string, boolean> = {}
        data.modules.forEach((m: any) => {
          modules[m.key] = m.isActive
        })
        setActiveModules(modules)
      } catch (error) {
        console.error('Error fetching modules:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchModules()

    // Sett opp socket.io-tilkobling for automatiske oppdateringer
    try {
      const socket = io(`${window.location.protocol}//${window.location.hostname}:3001`, {
        path: '/socket.io',
        transports: ['websocket']
      })

      socket.on('connect', () => {
        console.log('Socket.io tilkoblet for modul-oppdateringer')
      })

      socket.on('connect_error', (error) => {
        console.error('Socket.io tilkoblingsfeil:', error.message)
      })

      // Lytt etter oppdateringer av moduler
      socket.on('modules:updated', () => {
        console.log('Moduler oppdatert, henter nye data')
        fetchModules()
        router.refresh() // Oppdater hele siden
      })

      // Lytt etter generiske oppdateringshendelser
      socket.on('data:refresh', () => {
        console.log('Mottok global oppdateringsforespørsel')
        router.refresh()
      })

      return () => {
        socket.disconnect()
      }
    } catch (error) {
      console.error('Kunne ikke koble til Socket.io:', error)
    }
  }, [router])

  // Standardnavigasjon
  const navigationItems = [
    { icon: Home, title: "Hjem", href: "/employee-dashboard", color: "text-gray-600" },
    { icon: BookOpen, title: "HMS Håndbok", href: "/employee/hms-handbook", color: "text-blue-600" },
    { icon: FileText, title: "SJA", href: "/employee/sja", color: "text-green-600" },
    { icon: AlertTriangle, title: "Avvik", href: "/employee/deviations", color: "text-orange-600" },
    { icon: FileBox, title: "Dokumenter", href: "/employee/documents", color: "text-indigo-600" },
    { icon: TestTube, title: "Stoffkartotek", href: "/employee/stoffkartotek", color: "text-purple-600" },
  ]

  // Sjekk om kompetanse-modulen er aktiv (enten COMPETENCE eller COMPETENCY)
  const hasCompetencyModule = activeModules.COMPETENCE || activeModules.COMPETENCY
  
  // Sjekk om vernerunde-modulen er aktiv
  const hasSafetyRoundsModule = activeModules.SAFETY_ROUNDS

  // Full navigasjon inkludert valgfrie moduler
  const fullNavigationItems = [
    ...navigationItems,
    ...(hasSafetyRoundsModule ? [{ icon: ClipboardCheck, title: "Vernerunder", href: "/employee/safety-rounds", color: "text-teal-600" }] : []),
    ...(hasCompetencyModule ? [{ icon: Award, title: "Kompetanse", href: "/employee/competence", color: "text-amber-600" }] : [])
  ]

  // Vis en loading-melding hvis vi fortsatt laster sesjonen
  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Laster dashbord...</div>;
  }
  
  // Hvis brukeren ikke er autorisert, vis en melding istedenfor å vente på omdirigering
  if (status === "authenticated" && !isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="p-8 text-center bg-white rounded shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Feil dashboard for din rolle</h2>
          <p className="mb-4">Du er logget inn som {session?.user?.role}, og bør bruke hoved-dashboardet.</p>
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            Gå til hoved-dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {isLoading && (
        <div className="fixed top-2 right-2 z-50 animate-pulse">
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md text-xs flex items-center">
            Laster innhold...
          </span>
        </div>
      )}
      
      {children}
      
      {/* Bottom Navigation */}
      <div className="sticky bottom-0 bg-white border-t px-4 py-2">
        <div className="flex justify-around">
          {(!isLoading ? fullNavigationItems : navigationItems).map((item) => (
            <TooltipProvider key={item.href}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href={item.href}>
                    <div className="p-2">
                      <item.icon 
                        className={`w-6 h-6 ${
                          pathname.startsWith(item.href) ? item.color : "text-gray-500"
                        }`} 
                      />
                    </div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{item.title}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>
    </div>
  )
} 