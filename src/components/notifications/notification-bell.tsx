"use client"

import { useEffect, useState, useCallback } from "react"
import { Bell, Settings } from "lucide-react"
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
import { io } from "socket.io-client"
import { NotificationSettingsDialog } from "./notification-settings-dialog"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
  metadata?: any
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [hasNewNotifications, setHasNewNotifications] = useState(false)

  const unreadCount = notifications.filter(n => !n.isRead).length

  // Memoizer fetchNotifications for å unngå unødvendige re-renders
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications", {
        // Legg til cache-kontroll headers
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      if (!response.ok) throw new Error("Kunne ikke hente varsler")
      const data = await response.json()
      setNotifications(data)
      setHasNewNotifications(data.some((n: Notification) => !n.isRead))
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }, [])

  useEffect(() => {
    // Initial fetch
    fetchNotifications()

    // WebSocket setup
    const socket = io(`${window.location.protocol}//${window.location.hostname}:3001`, {
      path: '/api/socketio',
      transports: ['websocket'], // Bruk kun websocket, unngå polling
      reconnectionDelay: 1000,
      reconnection: true,
      reconnectionAttempts: 10
    })

    // Sett opp en intervall-basert fallback med lengre intervall
    const pollInterval = setInterval(() => {
      if (!socket.connected) {
        fetchNotifications()
      }
    }, 30000) // Sjekk hvert 30. sekund hvis websocket er nede

    socket.on('connect', () => {
      console.log('WebSocket connected:', socket.id)
      // Stopp polling når websocket er tilkoblet
      clearInterval(pollInterval)
    })

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected, falling back to polling')
    })

    socket.on('notification', (notification: Notification) => {
      console.log('New notification received:', notification)
      setNotifications(prev => [notification, ...prev])
      setHasNewNotifications(true)
    })

    return () => {
      console.log('Cleaning up WebSocket connection')
      socket.disconnect()
      clearInterval(pollInterval)
    }
  }, [fetchNotifications])

  async function markAsRead(id: string) {
    try {
      await fetch(`/api/notifications/${id}/read`, { 
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      setNotifications(prev =>
        prev.map(n =>
          n.id === id ? { ...n, isRead: true } : n
        )
      )

      // Sjekk om det fortsatt er uleste varsler
      const stillHasUnread = notifications.some(n => !n.isRead && n.id !== id)
      setHasNewNotifications(stillHasUnread)
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  // Når dropdown åpnes
  const handleDropdownOpen = (open: boolean) => {
    setIsOpen(open)
    if (open) {
      setHasNewNotifications(false)
    }
  }

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={handleDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`relative ${hasNewNotifications ? 'animate-pulse' : ''}`}
          >
            <Bell className={`h-5 w-5 ${hasNewNotifications ? 'text-primary' : ''}`} />
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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings className="h-4 w-4" />
            </Button>
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
                className={`p-4 cursor-pointer ${!notification.isRead ? 'bg-muted/50' : ''}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className={`font-medium ${!notification.isRead ? 'text-primary' : ''}`}>
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
        </DropdownMenuContent>
      </DropdownMenu>

      <NotificationSettingsDialog 
        open={settingsOpen} 
        onOpenChange={setSettingsOpen} 
      />
    </>
  )
} 