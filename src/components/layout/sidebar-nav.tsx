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
  onNavigate?: () => void
}

export function SidebarNav({ modules, onNavigate }: SidebarNavProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { mainNav, reportNav, bottomNav } = getNavItems({ 
    role: session?.user?.role,
    modules 
  })

  const handleClick = () => {
    onNavigate?.()
  }

  return (
    <nav className="flex flex-col space-y-4">
      <div className="space-y-1">
        {mainNav.map((item) => (
          <div key={item.href}>
            <Link
              href={item.href}
              onClick={handleClick}
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

            {item.children && (
              <div className="ml-6 mt-1 space-y-1">
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={handleClick}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                      pathname === child.href
                        ? "bg-green-50 text-green-700" 
                        : "text-gray-600 hover:bg-gray-50 dark:text-neutral-400 dark:hover:bg-neutral-800"
                    )}
                  >
                    {child.icon && <child.icon className="h-4 w-4" />}
                    {child.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
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