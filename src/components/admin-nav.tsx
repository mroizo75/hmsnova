"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  Building2, 
  ClipboardList, 
  FileCheck, 
  LayoutDashboard, 
  Settings, 
  Users 
} from "lucide-react"

const adminNavItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard
  },
  {
    title: "Bedrifter",
    href: "/admin/companies",
    icon: Building2
  },
  {
    title: "Brukere",
    href: "/admin/users",
    icon: Users
  },
  {
    title: "Vernerunder",
    href: "/admin/safety-rounds/dashboard",
    icon: ClipboardList,
    children: [
      {
        title: "Dashboard",
        href: "/admin/safety-rounds/dashboard",
        icon: LayoutDashboard
      },
      {
        title: "Maler",
        href: "/admin/safety-rounds/templates",
        icon: FileCheck
      },
      {
        title: "Oversikt",
        href: "/admin/safety-rounds",
        icon: ClipboardList
      }
    ]
  },
  {
    title: "Innstillinger",
    href: "/admin/settings",
    icon: Settings
  }
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="space-y-1">
      {adminNavItems.map((item) => (
        <div key={item.href}>
          <Link
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              pathname === item.href ? "bg-accent" : "transparent"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.title}
          </Link>
          {item.children && (
            <div className="ml-4 mt-1 space-y-1">
              {item.children.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    pathname === child.href ? "bg-accent" : "transparent"
                  )}
                >
                  <child.icon className="h-4 w-4" />
                  {child.title}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  )
} 