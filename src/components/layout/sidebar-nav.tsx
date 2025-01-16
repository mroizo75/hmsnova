"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { getNavItems, type NavItem } from "@/config/nav"

interface SidebarNavProps {
  modules: {
    key: string
    label: string
    isActive: boolean
  }[]
}

export function SidebarNav({ modules }: SidebarNavProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { mainNav, reportNav, bottomNav } = getNavItems({ 
    role: session?.user?.role,
    modules 
  })

  return (
    <nav className="flex flex-col space-y-4">
      <div className="space-y-1">
        {mainNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
              pathname === item.href
                ? "bg-green-50 text-green-700" 
                : "text-gray-700 hover:bg-gray-50 dark:text-neutral-200 dark:hover:bg-neutral-800"
            )}
          >
            {item.icon && <item.icon className="h-5 w-5" />}
            {item.title}
          </Link>
        ))}
      </div>

      {reportNav.length > 0 && (
        <div className="space-y-4">
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold dark:text-neutral-200">Rapporter</h2>
            <div className="space-y-1">
              {reportNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2 text-sm font-medium",
                    pathname === item.href
                      ? "bg-green-50 text-green-700"
                      : "text-gray-700 hover:bg-gray-50 dark:text-neutral-200 dark:hover:bg-neutral-800"
                  )}
                >
                  {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-auto pt-4 border-t dark:border-neutral-800">
        {bottomNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
              pathname === item.href
                ? "bg-green-50 text-green-700"
                : "text-gray-700 hover:bg-gray-50 dark:text-neutral-200 dark:hover:bg-neutral-800"
            )}
          >
            {item.icon && <item.icon className="h-5 w-5" />}
            {item.title}
          </Link>
        ))}
      </div>
    </nav>
  )
} 