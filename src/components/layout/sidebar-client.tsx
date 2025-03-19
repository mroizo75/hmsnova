'use client'

import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
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
  FileBox,
  Award,
  PanelLeftClose,
  PanelLeftOpen,
  Search, 
  ChevronDown,
  ChevronRight,
  Star,
  ClipboardCheck,
  FileWarning,
  HardHat,
  Home
} from "lucide-react"
import Image from "next/image"
import { LucideIcon } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SidebarClientProps {
  modules: {
    key: string
    label: string
    isActive: boolean
  }[]
  onItemClick?: () => void
}

interface NavigationItem {
  name: string
  href: string
  icon: LucideIcon
  children?: NavigationItem[]
  requiresModule?: boolean
  category?: string
}

// Definer kategorier for navigasjonselementer
const CATEGORIES = {
  DASHBOARD: "Dashboard",
  HMS: "HMS",
  DOCUMENTS: "Dokumenter",
  USERS: "Brukere",
  SETTINGS: "Innstillinger",
  OTHER: "Andre"
}

// Alltid tilgjengelige navigasjonselementer
const baseNavigation: NavigationItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
    category: CATEGORIES.DASHBOARD
  },
  {
    name: "Ansatte",
    href: "/dashboard/employees",
    icon: Users,
    category: CATEGORIES.USERS
  },
  {
    name: "HMS Håndbok",
    href: "/dashboard/hms-handbook",
    icon: FileText,
    category: CATEGORIES.HMS
  },
  {
    name: "Stoffkartotek",
    href: "/dashboard/stoffkartotek",
    icon: Beaker,
    category: CATEGORIES.HMS
  },
  {
    name: "SJA",
    href: "/dashboard/sja",
    icon: Shield,
    category: CATEGORIES.HMS
  },
  {
    name: "Risikoanalyse",
    href: "/dashboard/risk-assessments",
    icon: Bandage,
    category: CATEGORIES.HMS
  },
  {
    name: "Avvik",
    href: "/dashboard/deviations",
    icon: AlertTriangle,
    category: CATEGORIES.HMS
  },
  {
    name: "Dokumenter",
    href: "/dashboard/documents",
    icon: FileText,
    category: CATEGORIES.DOCUMENTS
  },
  {
    name: "Utstyr",
    href: "/dashboard/equipment",
    icon: Wrench,
    children: [
      {
        name: "Oversikt",
        href: "/dashboard/equipment",
        icon: Wrench
      },
      {
        name: "Inspeksjoner",
        href: "/dashboard/equipment/inspections",
        icon: ClipboardList
      }
    ],
    category: CATEGORIES.HMS
  },
]

// Bunnavigasjon (alltid nederst)
const bottomNavigation: NavigationItem[] = [
  {
    name: "Innstillinger",
    href: "/settings",
    icon: Settings,
    category: CATEGORIES.SETTINGS
  }
]

// Modifiser baseNavigation for å inkludere kategorier
const baseNavigationWithCategories: NavigationItem[] = [
  ...baseNavigation,
  ...bottomNavigation
]

// Modifiser moduleBasedNavigation for å inkludere kategorier
const moduleBasedNavigation: Record<string, NavigationItem> = {
  HMS_HANDBOOK: {
    name: "HMS-håndbok",
    href: "/dashboard/hms-handbook",
    icon: FileText,
    requiresModule: true,
    category: CATEGORIES.HMS
  },
  DEVIATIONS: {
    name: "Avvik",
    href: "/dashboard/deviations",
    icon: AlertTriangle,
    requiresModule: true,
    category: CATEGORIES.HMS
  },
  SJA: {
    name: "Sikker jobbanalyse",
    href: "/dashboard/sja",
    icon: ClipboardList,
    requiresModule: true,
    category: CATEGORIES.HMS
  },
  RISK_ASSESSMENTS: {
    name: "Risikovurderinger",
    href: "/dashboard/risk-assessments",
    icon: FileWarning,
    requiresModule: true,
    category: CATEGORIES.HMS
  },
  SAFETY_ROUNDS: {
    name: "Vernerunder",
    href: "/dashboard/safety-rounds",
    icon: HardHat,
    requiresModule: true,
    category: CATEGORIES.HMS
  },
  COMPETENCE: {
    name: "Kompetanse",
    href: "/dashboard/competence",
    icon: Award,
    requiresModule: true,
    category: CATEGORIES.HMS
  },
  INTERNAL_AUDIT: {
    name: "Internrevisjon",
    href: "/dashboard/reports/internal-audit",
    icon: FileText,
    category: CATEGORIES.DOCUMENTS
  }
}

export function SidebarClient({ modules, onItemClick }: SidebarClientProps) {
  const pathname = usePathname()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    [CATEGORIES.DASHBOARD]: true,
    [CATEGORIES.HMS]: true,
    [CATEGORIES.DOCUMENTS]: true,
    [CATEGORIES.USERS]: true,
    [CATEGORIES.SETTINGS]: false,
    [CATEGORIES.OTHER]: false
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [favorites, setFavorites] = useState<string[]>([])

  // Load favorites from localStorage on initial load
  useEffect(() => {
    const savedFavorites = localStorage.getItem('sidebarFavorites')
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
  }, [])

  // Save favorites to localStorage when they change
  useEffect(() => {
    localStorage.setItem('sidebarFavorites', JSON.stringify(favorites))
  }, [favorites])

  const hasActiveModule = (key: string) => {
    return modules.some(module => module.key === key && module.isActive)
  }

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  // Toggle favorite status
  const toggleFavorite = (href: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setFavorites(prev => {
      if (prev.includes(href)) {
        return prev.filter(item => item !== href)
      } else {
        return [...prev, href]
      }
    })
  }

  // Kombiner base-navigasjon med aktive modul-baserte elementer
  const allNavigationItems = [
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

  // Organiser navigasjonselementer etter kategori
  const categorizedNavigation: Record<string, NavigationItem[]> = {}
  
  allNavigationItems.forEach(item => {
    const category = item.category || CATEGORIES.OTHER
    if (!categorizedNavigation[category]) {
      categorizedNavigation[category] = []
    }
    categorizedNavigation[category].push(item)
  })

  // Filtrer navigasjonselementer basert på søkeord
  const filterItems = (items: NavigationItem[]) => {
    if (!searchTerm) return items
    return items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  // Hent favoritt-elementer
  const favoriteItems = allNavigationItems.filter(item => favorites.includes(item.href))

  return (
    <div className={cn("flex flex-col h-full transition-all duration-300", 
      isSidebarCollapsed ? "w-16" : "w-64")}>
      <div className="flex items-center justify-between p-4">
        {!isSidebarCollapsed && (
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Søk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsSidebarCollapsed(prev => !prev)}
          className="ml-2"
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Favoritter */}
          {favoriteItems.length > 0 && !isSidebarCollapsed && (
            <div className="mb-4">
              <div
                className="flex items-center justify-between mb-2 cursor-pointer"
                onClick={() => toggleCategory("Favoritter")}
              >
                <h3 className="text-sm font-medium text-gray-500">Favoritter</h3>
                {expandedCategories["Favoritter"] ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                )}
              </div>
              {expandedCategories["Favoritter"] && (
                <div className="space-y-1">
                  {favoriteItems.map((item) => (
                    <NavItem
                      key={item.href}
                      item={item}
                      pathname={pathname}
                      onItemClick={onItemClick}
                      isSidebarCollapsed={isSidebarCollapsed}
                      isFavorite={true}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
            
          {/* Kategoriserte navigasjonselementer */}
          {Object.entries(categorizedNavigation).map(([category, items]) => {
            const filteredItems = filterItems(items)
            if (filteredItems.length === 0) return null
            
            return (
              <div key={category} className="mb-4">
                {!isSidebarCollapsed && (
                  <div
                    className="flex items-center justify-between mb-2 cursor-pointer"
                    onClick={() => toggleCategory(category)}
                  >
                    <h3 className="text-sm font-medium text-gray-500">{category}</h3>
                    {expandedCategories[category] ? (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                )}
                {(isSidebarCollapsed || expandedCategories[category] || searchTerm) && (
                  <div className="space-y-1">
                    {filteredItems.map((item) => (
                      <NavItem
                        key={item.href}
                        item={item}
                        pathname={pathname}
                        onItemClick={onItemClick}
                        isSidebarCollapsed={isSidebarCollapsed}
                        isFavorite={favorites.includes(item.href)}
                        onToggleFavorite={toggleFavorite}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}

// NavItem-komponent for å vise ett enkeltelement
function NavItem({ 
  item, 
  pathname, 
  onItemClick, 
  isSidebarCollapsed,
  isFavorite,
  onToggleFavorite
}: { 
  item: NavigationItem
  pathname: string
  onItemClick?: () => void
  isSidebarCollapsed: boolean
  isFavorite: boolean
  onToggleFavorite: (href: string, e: React.MouseEvent) => void
}) {
  const isActive = pathname === item.href
  
  if (isSidebarCollapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={item.href}
              onClick={onItemClick}
              className={cn(
                "flex items-center justify-center p-2 rounded-lg",
                isActive
                  ? "bg-green-50 text-green-700" 
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              <item.icon className="h-5 w-5" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{item.name}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }
  
  return (
    <div className="flex items-center group">
      <Link
        href={item.href}
        onClick={onItemClick}
        className={cn(
          "flex flex-1 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
          isActive
            ? "bg-green-50 text-green-700" 
            : "text-gray-700 hover:bg-gray-50"
        )}
      >
        <item.icon className="h-5 w-5 flex-shrink-0" />
        <span className="truncate">{item.name}</span>
      </Link>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 rounded-full opacity-0 group-hover:opacity-100"
        onClick={(e) => onToggleFavorite(item.href, e)}
      >
        <Star className={cn("h-4 w-4", isFavorite ? "fill-yellow-400 text-yellow-400" : "text-gray-400")} />
      </Button>
    </div>
  )
} 