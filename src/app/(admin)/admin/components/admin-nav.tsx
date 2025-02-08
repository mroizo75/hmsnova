"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  Building2, 
  ClipboardCheck, 
  Users, 
  Settings, 
  LayoutDashboard,
  ShieldCheck 
} from "lucide-react"

const items = [
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
    title: "HMS",
    items: [
      {
        title: "Vernerunder",
        href: "/admin/safety-rounds",
        icon: ClipboardCheck,
      },
      {
        title: "Vernerunde Maler",
        href: "/admin/safety-rounds/templates",
        icon: ShieldCheck,
      }
    ]
  },
  // ... andre eksisterende navigasjonselementer
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="grid items-start gap-2">
      {items.map((item, index) => {
        if (item.items) {
          return (
            <div key={index} className="space-y-2">
              <h4 className="px-3 text-sm font-medium text-muted-foreground">
                {item.title}
              </h4>
              <div className="grid gap-1 pl-3">
                {item.items.map((subItem, subIndex) => {
                  const Icon = subItem.icon
                  return (
                    <Link
                      key={subIndex}
                      href={subItem.href}
                    >
                      <span
                        className={cn(
                          "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                          pathname === subItem.href ? "bg-accent" : "transparent"
                        )}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        <span>{subItem.title}</span>
                      </span>
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        }

        const Icon = item.icon
        return (
          <Link
            key={index}
            href={item.href}
          >
            <span
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                pathname === item.href ? "bg-accent" : "transparent"
              )}
            >
              <Icon className="mr-2 h-4 w-4" />
              <span>{item.title}</span>
            </span>
          </Link>
        )
      })}
    </nav>
  )
} 