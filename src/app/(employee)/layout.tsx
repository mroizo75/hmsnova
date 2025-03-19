'use client'

import { 
  BookOpen, 
  FileText, 
  AlertTriangle,
  FileBox,
  TestTube,
  ClipboardCheck,
  Award
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useEffect, useState } from "react"

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [activeModules, setActiveModules] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)

  // Hent aktive moduler når komponenten lastes
  useEffect(() => {
    fetch('/api/user/modules')
      .then(res => res.json())
      .then(data => {
        const modules: Record<string, boolean> = {}
        data.modules.forEach((m: any) => {
          modules[m.key] = m.isActive
        })
        setActiveModules(modules)
        setIsLoading(false)
      })
      .catch(error => {
        console.error('Error fetching modules:', error)
        setIsLoading(false)
      })
  }, [])

  // Standardnavigasjon
  const navigationItems = [
    { icon: BookOpen, title: "HMS Håndbok", href: "/employee/hms-handbook", color: "text-blue-600" },
    { icon: FileText, title: "SJA", href: "/employee/sja", color: "text-green-600" },
    { icon: AlertTriangle, title: "Avvik", href: "/employee/deviations", color: "text-orange-600" },
    { icon: FileBox, title: "Dokumenter", href: "/employee/documents", color: "text-indigo-600" },
    { icon: TestTube, title: "Stoffkartotek", href: "/employee/stoffkartotek", color: "text-purple-600" },
    { icon: ClipboardCheck, title: "Vernerunder", href: "/employee/safety-rounds", color: "text-teal-600" }
  ]

  // Sjekk om kompetanse-modulen er aktiv (enten COMPETENCE eller COMPETENCY)
  const hasCompetencyModule = activeModules.COMPETENCE || activeModules.COMPETENCY

  // Full navigasjon inkludert valgfrie moduler
  const fullNavigationItems = [
    ...navigationItems,
    ...(hasCompetencyModule ? [{ icon: Award, title: "Kompetanse", href: "/employee/competence", color: "text-amber-600" }] : [])
  ]

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
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