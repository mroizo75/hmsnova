'use client'

import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  AlertTriangle,
  BarChart3,
  Settings,
  Bandage,
  Beaker,
  BookOpen,
  TestTube,
  Shield,
  ClipboardList,
  Wrench,
  FileBox
} from "lucide-react"
import Image from "next/image"
import { LucideIcon } from "lucide-react"

interface SidebarClientProps {
  modules: {
    key: string
    label: string
    isActive: boolean
  }[]
}

interface NavigationItem {
  name: string
  href: string
  icon: LucideIcon
  children?: NavigationItem[]
  requiresModule?: boolean
}

// Definer modul-mapping for navigasjon
const moduleBasedNavigation: Record<string, NavigationItem> = {
  SAFETY_ROUNDS: {
    name: 'Vernerunder',
    href: '/dashboard/safety-rounds',
    icon: BookOpen
  },
  INTERNAL_AUDIT: {
    name: 'Internrevisjon',
    href: '/dashboard/reports/internal-audit',
    icon: FileText
  },
}

// Alltid tilgjengelige navigasjonselementer
const baseNavigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    requiresModule: false
  },
  {
    name: 'Ansatte',
    href: '/dashboard/employees',
    icon: Users
  },
  {
    name: 'HMS Håndbok',
    href: '/dashboard/hms-handbook',
    icon: FileText
  },
  {
    name: 'Stoffkartotek',
    href: '/dashboard/stoffkartotek',
    icon: Beaker
  },
  {
    name: 'SJA',
    href: '/dashboard/sja',
    icon: Shield
  },
  {
    name: 'Risikoanalyse',
    href: '/dashboard/risk-assessments',
    icon: Bandage
  },
  {
    name: 'Avvik',
    href: '/dashboard/deviations',
    icon: AlertTriangle
  },
  {
    name: 'Dokumenter',
    href: '/dashboard/documents',
    icon: FileBox,
    requiresModule: false
  },
  {
    name: 'Utstyr',
    href: '/dashboard/equipment',
    icon: Wrench,
    children: [
      {
        name: 'Oversikt',
        href: '/dashboard/equipment',
        icon: Wrench
      },
      {
        name: 'Inspeksjoner',
        href: '/dashboard/equipment/inspections',
        icon: ClipboardList
      }
    ]
  },
]

// Bunnavigasjon (alltid nederst)
const bottomNavigation: NavigationItem[] = [
  {
    name: 'Innstillinger',
    href: '/settings',
    icon: Settings
  }
]

export function SidebarClient({ modules }: SidebarClientProps) {
  const pathname = usePathname()

  // Hjelpefunksjon for å sjekke om en modul er aktiv
  const hasActiveModule = (key: string) => {
    return modules.some(m => m.key === key && m.isActive)
  }

  // Kombiner base-navigasjon med aktive modul-baserte elementer
  const mainNavigation = [
    // Alltid vis disse elementene
    ...baseNavigation.filter(item => 
      // Filtrer ikke ut dokumenter og andre basis-elementer
      item.href === '/dashboard/documents' || 
      !item.requiresModule
    ),
    // Legg til modul-baserte elementer hvis de er aktive
    ...Object.entries(moduleBasedNavigation)
      .filter(([key]) => hasActiveModule(key))
      .map(([_, item]) => item)
  ]

  console.log('mainNavigation:', mainNavigation)

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-72 lg:flex-col">
      <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
        <div className="flex items-center h-16 px-6 border-b">
          <Link href="/dashboard" className="flex items-center">
            <Image src="/HMSNova-logo.svg" alt="HMS Nova" width={250} height={250} className="dark:hidden"/>
            <Image src="/HMSNova.svg" alt="HMS Nova" width={250} height={250} className="hidden dark:block"/>
          </Link>
        </div>
        <div className="flex flex-col flex-1 overflow-y-auto">
          <nav className="flex-1 p-4 space-y-1">
            {/* Hovednavigasjon */}
            {mainNavigation.map((item) => (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                    pathname === item.href
                      ? "bg-green-50 text-green-700" 
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
                
                {/* Vis undermenyer hvis de finnes */}
                {item.children && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.children.map((child: any) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                          pathname === child.href
                            ? "bg-green-50 text-green-700" 
                            : "text-gray-600 hover:bg-gray-50"
                        )}
                      >
                        <child.icon className="h-4 w-4" />
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Rapporter-seksjon */}
            <div className="space-y-4">
              <div className="px-3 py-2">
                <h2 className="mb-2 px-4 text-lg font-semibold">Rapporter</h2>
                <div className="space-y-1">
                  <Link 
                    href="/dashboard/reports"
                    className="flex items-center rounded-lg px-3 py-2 text-slate-900 hover:bg-slate-100"
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    HMS-årsrapport
                  </Link>
                  
                  {hasActiveModule('INTERNAL_AUDIT') && (
                    <Link 
                      href="/dashboard/reports/internal-audit"
                      className="flex items-center rounded-lg px-3 py-2 text-slate-900 hover:bg-slate-100"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Internrevisjon
                    </Link>
                  )}
                  
                  {hasActiveModule('SAFETY_ROUNDS') && (
                    <Link 
                      href="/dashboard/reports/safety-rounds" 
                      className="flex items-center rounded-lg px-3 py-2 text-slate-900 hover:bg-slate-100"
                    >
                      <ClipboardList className="mr-2 h-4 w-4" />
                      Vernerunderapporter
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </nav>

          {/* Bunnavigasjon */}
          <div className="p-4 mt-auto border-t">
            {bottomNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                  pathname === item.href
                    ? "bg-green-50 text-green-700" 
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 