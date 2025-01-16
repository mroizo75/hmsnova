import {
  LayoutDashboard,
  FileText,
  AlertTriangle,
  ClipboardCheck,
  Users,
  Building,
  Bandage,
  Beaker,
  BookOpen,
  TestTube,
  Shield,
  BarChart3,
  ClipboardList,
  type LucideIcon,
} from "lucide-react"

export interface NavItem {
  title: string
  href: string
  icon?: LucideIcon
  role?: string[]
  moduleKey?: string
}

// Base navigasjon som alltid er tilgjengelig
const baseNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Ansatte",
    href: "/dashboard/employees",
    icon: Users,
  },
  {
    title: "HMS-håndbok",
    href: "/dashboard/hms-handbook",
    icon: FileText,
  },
  {
    title: "Stoffkartotek",
    href: "/dashboard/stoffkartotek",
    icon: Beaker,
  },
  {
    title: "SJA",
    href: "/dashboard/sja",
    icon: Shield,
  },
  {
    title: "Risikoanalyse",
    href: "/dashboard/risk-assessments",
    icon: Bandage,
  },
  {
    title: "Avvik",
    href: "/dashboard/deviations",
    icon: AlertTriangle,
  },
]

// Modul-baserte navigasjonselementer
const moduleNavItems: NavItem[] = [
  {
    title: "Vernerunder",
    href: "/dashboard/safety-rounds",
    icon: BookOpen,
    moduleKey: "SAFETY_ROUNDS",
  },
  {
    title: "Internrevisjon",
    href: "/dashboard/reports/internal-audit",
    icon: FileText,
    moduleKey: "INTERNAL_AUDIT",
  },

]

// Rapport-navigasjon
const reportNavItems: NavItem[] = [
  {
    title: "HMS-årsrapport",
    href: "/dashboard/reports",
    icon: BarChart3,
  },
  {
    title: "Internrevisjon",
    href: "/dashboard/reports/internal-audit",
    icon: FileText,
    moduleKey: "INTERNAL_AUDIT",
  },
  {
    title: "Vernerunderapporter",
    href: "/dashboard/reports/safety-rounds",
    icon: ClipboardList,
    moduleKey: "SAFETY_ROUNDS",
  },
]

// Admin-spesifikk navigasjon
const adminNavItems: NavItem[] = [
  {
    title: "Brukere",
    href: "/admin/users",
    icon: Users,
    role: ["ADMIN"],
  },
  {
    title: "Bedrifter",
    href: "/admin/companies",
    icon: Building,
    role: ["ADMIN"],
  },
]

interface GetNavItemsOptions {
  role?: string
  modules?: {
    key: string
    isActive: boolean
  }[]
}

export function getNavItems({ role, modules = [] }: GetNavItemsOptions = {}) {
  // Filtrer modul-baserte elementer basert på aktive moduler
  const activeModuleItems = moduleNavItems.filter(
    item => !item.moduleKey || modules.some(m => m.key === item.moduleKey && m.isActive)
  )

  // Filtrer rapport-elementer basert på aktive moduler
  const activeReportItems = reportNavItems.filter(
    item => !item.moduleKey || modules.some(m => m.key === item.moduleKey && m.isActive)
  )

  if (role === "ADMIN") {
    return {
      mainNav: [...baseNavItems, ...activeModuleItems],
      reportNav: activeReportItems,
      bottomNav: adminNavItems,
    }
  }

  return {
    mainNav: [...baseNavItems, ...activeModuleItems],
    reportNav: activeReportItems,
    bottomNav: [],
  }
} 