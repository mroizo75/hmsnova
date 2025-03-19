"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  AlertTriangle,
  Settings,
  BookOpen,
  TestTube,
  FileBox,
  ClipboardCheck,
  Shield,
  Bandage,
  Wrench,
  ClipboardList,
  BarChart3,
  LucideIcon
} from "lucide-react"

interface MobileSidebarProps {
  modules: {
    key: string
    label: string
    isActive: boolean
  }[]
  onCloseAction: () => void
}

interface NavigationItem {
  name: string
  href: string
  icon: LucideIcon
  children?: NavigationItem[]
  moduleKey?: string
}

export function MobileSidebar({ modules, onCloseAction }: MobileSidebarProps) {
  const pathname = usePathname()

  // Hjelpefunksjon for å sjekke om en modul er aktiv
  const hasActiveModule = (key: string) => {
    return modules.some(m => m.key === key && m.isActive)
  }

  // Base navigasjon
  const baseNavigation: NavigationItem[] = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "HMS Håndbok", href: "/dashboard/hms-handbook", icon: BookOpen },
    { name: "SJA", href: "/dashboard/sja", icon: Shield },
    { name: "Avvik", href: "/dashboard/deviations", icon: AlertTriangle },
    { name: "Dokumenter", href: "/dashboard/documents", icon: FileBox },
    { name: "Stoffkartotek", href: "/dashboard/stoffkartotek", icon: TestTube },
    { name: "Risikoanalyse", href: "/dashboard/risk-assessments", icon: Bandage },
    { name: "Ansatte", href: "/dashboard/employees", icon: Users },
    { 
      name: "Utstyr", 
      href: "/dashboard/equipment", 
      icon: Wrench,
      children: [
        { name: "Oversikt", href: "/dashboard/equipment", icon: Wrench },
        { name: "Inspeksjoner", href: "/dashboard/equipment/inspections", icon: ClipboardList }
      ]
    }
  ]

  // Modul-basert navigasjon
  const moduleBasedNavigation: NavigationItem[] = [
    {
      name: "Vernerunder",
      href: "/dashboard/safety-rounds",
      icon: ClipboardCheck,
      moduleKey: "SAFETY_ROUNDS"
    },
    {
      name: "Rapporter",
      href: "/dashboard/reports",
      icon: BarChart3,
      moduleKey: "REPORTS"
    }
  ]

  // Kombiner navigasjon basert på aktive moduler
  const navigation: NavigationItem[] = [
    ...baseNavigation,
    ...moduleBasedNavigation.filter(item => hasActiveModule(item.moduleKey || "")),
    { name: "Innstillinger", href: "/dashboard/settings", icon: Settings }
  ]

  return (
    <nav className="flex-1 overflow-y-auto">
      <ul className="space-y-1 p-2">
        {navigation.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onCloseAction}
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg",
                pathname === item.href
                  ? "bg-green-50 text-green-700" 
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              <item.icon className="h-6 w-6" />
              {item.name}
            </Link>
            {item.children && (
              <ul className="ml-6 mt-2 space-y-1">
                {item.children.map((child: any) => (
                  <li key={child.href}>
                    <Link
                      href={child.href}
                      onClick={onCloseAction}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg",
                        pathname === child.href
                          ? "bg-green-50 text-green-700" 
                          : "text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      <child.icon className="h-5 w-5" />
                      {child.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
} 