'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useSession } from "next-auth/react"

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname()
  const { data: session } = useSession()
  
  // Ansatt-meny
  if (session?.user?.role === 'EMPLOYEE') {
    return (
      <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)}>
        <Link
          href="/employee-dashboard"
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === "/employee-dashboard" ? "text-black dark:text-white" : "text-muted-foreground"
          )}
        >
          Oversikt
        </Link>
        <Link
          href="/employee/tasks"
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === "/employee/tasks" ? "text-black dark:text-white" : "text-muted-foreground"
          )}
        >
          Mine oppgaver
        </Link>
        <Link
          href="/employee/documents"
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === "/employee/documents" ? "text-black dark:text-white" : "text-muted-foreground"
          )}
        >
          Dokumenter
        </Link>
      </nav>
    )
  }

  // Admin-meny (eksisterende kode)
  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)}>
      {/* Behold eksisterende admin-navigasjon */}
    </nav>
  )
} 