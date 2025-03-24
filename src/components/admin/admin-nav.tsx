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
  ClipboardCheck,
  Award,
  Users2,
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
    label: "CRM",
    icon: Users2,
    href: "/admin/crm",
    pattern: /^\/admin\/crm/
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
    label: "Kompetansestyring",
    icon: Award,
    href: "/admin/competence",
    pattern: /^\/admin\/competence/
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
      callbackUrl: "/",
      redirect: false
    }).then(() => {
      // Tving sletting av alle cookies
      const cookies = document.cookie.split(";");
      cookies.forEach(cookie => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      });
      
      // Deretter rens lokal lagring
      localStorage.clear();
      sessionStorage.clear();
      
      // Erstatter current history state for å hindre tilbakenavigering
      if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
        window.history.replaceState(null, '', '/');
      }
      
      // Til slutt, redirect med force reload (bruker window.location.replace for å erstatte i historikk)
      window.location.replace("/?logout=complete&t=" + Date.now());
    });
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