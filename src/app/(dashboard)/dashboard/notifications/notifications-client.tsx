"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { formatDistanceToNow } from "date-fns"
import { nb } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check, Trash } from "lucide-react"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface NotificationsClientProps {
  initialData: any[]
}

export function NotificationsClient({ initialData }: NotificationsClientProps) {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const queryClient = useQueryClient()

  const { data: notifications = initialData } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await fetch('/api/notifications')
      if (!response.ok) throw new Error('Kunne ikke hente varsler')
      return response.json()
    },
    initialData,
    refetchInterval: 30000
  })

  const filteredNotifications = notifications.filter((notification: any) => {
    if (filter === 'unread') return !notification.read
    if (filter === 'read') return notification.read
    return true
  })

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST' })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Markert som lest')
    } catch (error) {
      toast.error('Kunne ikke markere som lest')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await fetch('/api/notifications/mark-all-read', { method: 'POST' })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Alle varsler markert som lest')
    } catch (error) {
      toast.error('Kunne ikke markere alle som lest')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Varsel slettet')
    } catch (error) {
      toast.error('Kunne ikke slette varsel')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Varsler</h1>
        <div className="flex gap-4">
          <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrer varsler" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle varsler</SelectItem>
              <SelectItem value="unread">Uleste varsler</SelectItem>
              <SelectItem value="read">Leste varsler</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleMarkAllAsRead}>
            <Check className="h-4 w-4 mr-2" />
            Merk alle som lest
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            Ingen varsler å vise
          </Card>
        ) : (
          filteredNotifications.map((notification: any) => (
            <Card key={notification.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className={`font-medium ${!notification.read ? 'text-primary' : ''}`}>
                    {notification.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                      locale: nb
                    })}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(notification.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
} 