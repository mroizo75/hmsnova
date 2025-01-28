"use client"

import { useEffect, useState } from "react"
import { Bell, Settings, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from "date-fns"
import { nb } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { NotificationSettingsDialog } from "./notification-settings-dialog"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
  link?: string  // URL til avvik/SJA/etc
  entityId?: string  // ID til relatert element
}

interface NotificationBellProps {
  onSettingsClick?: () => void;
}

export function NotificationBell({ onSettingsClick }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const router = useRouter()

  // Bruk React Query for å hente notifikasjoner
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await fetch('/api/notifications')
      if (!response.ok) throw new Error('Kunne ikke hente varsler')
      return response.json()
    },
    refetchInterval: 30000
  })

  const unreadCount = notifications.filter(n => !n.read).length

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST' })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    } catch (error) {
      toast.error('Kunne ikke markere som lest')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await fetch('/api/notifications/mark-all-read', { method: 'POST' })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Alle varsler markert som lest')
      setIsOpen(false) // Lukk dropdown etter handling
    } catch (error) {
      toast.error('Kunne ikke markere alle som lest')
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Marker som lest
      await handleMarkAsRead(notification.id)
      
      // Naviger til riktig side basert på type
      if (notification.link) {
        router.push(notification.link)
      } else if (notification.entityId) {
        switch (notification.type) {
          case 'DEVIATION':
            router.push(`/dashboard/deviations/${notification.entityId}`)
            break
          case 'SJA':
            router.push(`/dashboard/sja/${notification.entityId}`)
            break
          case 'HMS_CHANGE':
            router.push(`/dashboard/hms-handbook`)
            break
        }
      }
      setIsOpen(false)  // Lukk dropdown etter navigering
    } catch (error) {
      toast.error('Kunne ikke åpne varselet')
    }
  }

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
          >
            <Bell className={`h-5 w-5 ${unreadCount > 0 ? 'text-primary' : ''}`} />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
              >
                {unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <div className="flex items-center justify-between p-2">
            <h4 className="font-medium">Varsler</h4>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleMarkAllAsRead}
              >
                <Check className="h-4 w-4 mr-1" />
                Merk alle som lest
              </Button>
            )}
          </div>
          <DropdownMenuSeparator />
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              Ingen varsler
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`p-4 cursor-pointer ${!notification.read ? 'bg-muted/50' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className={`font-medium ${!notification.read ? 'text-primary' : ''}`}>
                      {notification.title}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                        locale: nb
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {notification.message}
                  </p>
                </div>
              </DropdownMenuItem>
            ))
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onSettingsClick}>
            <Settings className="mr-2 h-4 w-4" />
            Innstillinger
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/notifications" className="w-full">
              Se alle varsler
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
} 