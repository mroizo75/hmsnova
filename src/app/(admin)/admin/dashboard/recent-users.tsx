"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { nb } from "date-fns/locale"

interface RecentUsersProps {
  users: {
    id: string
    name: string | null
    email: string
    role: string
    createdAt: Date
    company: { name: string } | null
  }[]
}

export function RecentUsers({ users }: RecentUsersProps) {
  return (
    <div className="space-y-4">
      {users.map(user => (
        <div
          key={user.id}
          className="flex items-center space-x-4 rounded-lg border p-3"
        >
          <Avatar className="h-9 w-9">
            <AvatarFallback>
              {user.name?.charAt(0) || user.email.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.name || user.email}
            </p>
            <div className="flex items-center text-xs text-muted-foreground">
              <span className="capitalize">{user.role.toLowerCase()}</span>
              {user.company && (
                <>
                  <span className="px-1">•</span>
                  <span>{user.company.name}</span>
                </>
              )}
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {formatDistanceToNow(user.createdAt, {
              addSuffix: true,
              locale: nb
            })}
          </div>
        </div>
      ))}
    </div>
  )
} 