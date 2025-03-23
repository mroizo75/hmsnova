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

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [activeModules, setActiveModules] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)

  // Hent aktive moduler når komponenten lastes
  useEffect(() => {
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