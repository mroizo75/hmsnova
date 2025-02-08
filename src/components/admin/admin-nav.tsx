'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"
import {
  LayoutDashboard,
  Building2,
  FileText,
  Users,
  LogOut,
  Settings,
  HardHat,
  ClipboardCheck
} from "lucide-react"

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin/dashboard",
    pattern: /^\/admin\/dashboard/
  },
  {
    label: "Bedrifter",
    icon: Building2,
    href: "/admin/companies",
    pattern: /^\/admin\/companies/
  },
  {
    label: "HMS-maler",
    icon: FileText,
    href: "/admin/hms-templates",
    pattern: /^\/admin\/hms-templates/
  },
  {
    label: "Vernerunder",
    icon: HardHat,
    href: "/admin/safety-rounds",
    pattern: /^\/admin\/safety-rounds(?!\/templates)/
  },
  {
    label: "Vernerunde Maler",
    icon: ClipboardCheck,
    href: "/admin/safety-rounds/templates",
    pattern: /^\/admin\/safety-rounds\/templates/
  },
  {
    label: "Brukere",
    icon: Users,
    href: "/admin/users",
    pattern: /^\/admin\/users/
  },
  {
    label: "Instillinger",
    icon: Settings,
    href: "/admin/settings",
    pattern: /^\/admin\/settings/
  }
]

export function AdminNav() {
  const pathname = usePathname()

  const handleLogout = async () => {
    await signOut({
      callbackUrl: "/login"
    })
  }

  return (
    <nav className="space-y-2">
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "flex items-center gap-2 p-2 hover:bg-accent rounded-lg transition-colors",
            route.pattern.test(pathname) && "bg-accent"
          )}
        >
          <route.icon className="h-4 w-4" />
          {route.label}
        </Link>
      ))}

      <Button 
        variant="ghost" 
        className="w-full justify-start gap-2 p-2 font-normal hover:bg-destructive/10"
        onClick={handleLogout}
      >
        <LogOut className="h-4 w-4" />
        Logg ut
      </Button>
    </nav>
  )
} 