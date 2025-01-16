"use client"

import { formatDistanceToNow } from "date-fns"
import { nb } from "date-fns/locale"
import { ShieldAlert, ClipboardCheck } from "lucide-react"

interface ActivityFeedProps {
  deviations: {
    id: string
    title: string
    createdAt: Date
    company: { name: string } | null
  }[]
  safetyRounds: {
    id: string
    title: string
    createdAt: Date
    company: { name: string } | null
  }[]
}

export function ActivityFeed({ deviations, safetyRounds }: ActivityFeedProps) {
  // Kombiner og sorter aktiviteter
  const activities = [
    ...deviations.map(d => ({
      ...d,
      type: 'deviation' as const
    })),
    ...safetyRounds.map(s => ({
      ...s,
      type: 'safetyRound' as const
    }))
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

  return (
    <div className="space-y-4">
      {activities.map(activity => (
        <div
          key={activity.id}
          className="flex items-start space-x-4 rounded-lg border p-3"
        >
          {activity.type === 'deviation' ? (
            <ShieldAlert className="h-5 w-5 mt-0.5 text-yellow-500" />
          ) : (
            <ClipboardCheck className="h-5 w-5 mt-0.5 text-green-500" />
          )}
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">
              {activity.title}
            </p>
            <div className="flex items-center text-sm text-muted-foreground">
              <span>{activity.company?.name}</span>
              <span className="px-1">•</span>
              <span>
                {formatDistanceToNow(activity.createdAt, {
                  addSuffix: true,
                  locale: nb
                })}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 