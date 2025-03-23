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
import { useSession } from "next-auth/react"

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
  const { status } = useSession()
  const isAuthenticated = status === "authenticated"

  // Bruk React Query for å hente notifikasjoner
  const { data: notifications = [], isLoading, isError, refetch } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      try {
        console.log('Henter varsler, autentiseringsstatus:', status)
        const response = await fetch('/api/notifications', {
          credentials: 'include',
          cache: 'no-store',
          headers: {
            'Accept': 'application/json'
          }
        })
        
        console.log('Notifikasjons-API svarte med status:', response.status)
        
        if (!response.ok) {
          if (response.status === 401) {
            console.log('401 Unauthorized - Ikke innlogget')
            return [] // Returner tom liste hvis ikke innlogget
          }
          throw new Error('Kunne ikke hente varsler')
        }
        
        const data = await response.json()
        console.log(`Hentet ${data.length} varsler`)
        return data
      } catch (e) {
        console.error('Feil ved henting av varsler:', e)
        return [] // Returner tom liste ved feil
      }
    },
    refetchInterval: isAuthenticated ? 30000 : false, // Bare polle hvis innlogget
    enabled: status !== 'loading' // Ikke kjør før auth-status er lastet
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
      if (!isAuthenticated) {
        toast.error('Du må være logget inn for å utføre denne handlingen')
        return
      }

      // Sjekk om det finnes noen uleste varsler først
      const hasUnreadNotifications = notifications.some(n => !n.read)
      
      if (!hasUnreadNotifications) {
        toast.info('Alle varsler er allerede markert som lest')
        return
      }

      // Fjerner optimistisk oppdatering for å unngå feil hvis API feiler
      // Istedenfor bruker vi en midlertidig oppdatering som vi kan rulle tilbake

      // Lagre nåværende notifikasjoner for å kunne gjenopprette dem
      const currentNotifications = [...notifications]
      
      // Vis suksessmelding
      toast.success('Markerer varsler som lest...')
      setIsOpen(false) // Lukk dropdown etter handling
      
      // Oppdater UI midlertidig
      queryClient.setQueryData(['notifications'], (oldData: Notification[] | undefined) => 
        (oldData || []).map(n => ({ ...n, read: true }))
      )
      
      // Gjør API-kall
      console.log('Sender forespørsel til mark-all-read API...')
      const response = await fetch('/api/notifications/mark-all-read', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        cache: 'no-store'
      })
      
      console.log('API respons status:', response.status, response.statusText)
      
      if (!response.ok) {
        // Rulle tilbake endringer i UI hvis API-kallet feilet
        queryClient.setQueryData(['notifications'], currentNotifications)
        
        const errorText = await response.text()
        console.error('API svarte med feil:', response.status, errorText)
        try {
          const errorData = JSON.parse(errorText)
          console.error('API feilmeldingsdetaljer:', errorData)
        } catch (e) {
          console.error('Kunne ikke parse feilresponsen som JSON')
        }
        
        toast.error('Kunne ikke markere alle varsler som lest')
      } else {
        const result = await response.json()
        console.log('API svarte med suksess:', result)
        
        if (result.count === 0) {
          toast.info('Ingen uleste varsler å markere')
        } else {
          toast.success(`${result.count} varsler markert som lest`)
        }
        
        // Oppdater frontend data
        setTimeout(() => {
          refetch()
        }, 300)
      }
    } catch (error) {
      console.error('Feil ved markering av alle varsler som lest:', error)
      toast.error(error instanceof Error ? error.message : 'Kunne ikke markere alle som lest')
      
      // Sikre at vi oppdaterer uansett
      refetch()
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
            {notifications.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={!notifications.some(n => !n.read)}
                title={notifications.some(n => !n.read) ? 'Merk alle som lest' : 'Alle varsler er allerede lest'}
              >
                <Check className="h-4 w-4 mr-1" />
                {notifications.some(n => !n.read) ? 'Merk alle som lest' : 'Alle er lest'}
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