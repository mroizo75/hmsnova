"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut, useSession } from "next-auth/react"
import { User, Settings, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { NotificationSettingsDialog } from "@/components/notifications/notification-settings-dialog"
import { useState, useEffect } from "react"

interface HeaderProps {
  user: any;
  className?: string;
}

export function Header({ user, className }: HeaderProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [companyName, setCompanyName] = useState<string>("")

  useEffect(() => {
    async function fetchCompanyName() {
      try {
        const response = await fetch('/api/company/name')
        const data = await response.json()
        setCompanyName(data.name)
      } catch (error) {
        console.error('Error fetching company name:', error)
      }
    }

    if (user) {
      fetchCompanyName()
    }
  }, [user])

  // Hvis user-prop ikke finnes, vis en nødløsning
  if (!user) {
    console.warn("Header: user prop er ikke definert");
    return (
      <header className="border-b bg-background dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex h-16 items-center px-4 gap-4">
          <div className="flex-1">
            <span className="text-muted-foreground">Debug: Header mangler user-data</span>
          </div>
        </div>
      </header>
    );
  }

  // Hvis useSession ikke har data, bruk props-dataene
  const effectiveUser = user;

  return (
    <header className="border-b bg-background dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex h-16 items-center px-4 gap-4">
        <div className="flex-1">
          <div className="flex flex-col">
            <span className="text-muted-foreground hidden lg:block">
              Velkommen, {effectiveUser.name || effectiveUser.email}
            </span>
            {companyName && (
              <span className="text-muted-foreground hidden lg:block">
                {companyName}
              </span>
            )}
          </div>
        </div>
        <NotificationBell onSettingsClick={() => setSettingsOpen(true)} />
        <NotificationSettingsDialog 
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative dark:text-neutral-100">
              {effectiveUser.name || effectiveUser.email}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel className="dark:text-neutral-200">Min konto</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => {
              if (effectiveUser.role === 'EMPLOYEE') {
                router.push("/employee/settings")
              } else {
                router.push("/profile")
              }
            }}>
              <User className="mr-2 h-4 w-4" />
              <span>Profil</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              if (effectiveUser.role === 'EMPLOYEE') {
                router.push("/employee/settings")
              } else {
                router.push("/settings")
              }
            }}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Innstillinger</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logg ut</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
} 