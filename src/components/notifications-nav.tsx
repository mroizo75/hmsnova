"use client"

import { NotificationBell } from "@/components/notifications/notification-bell"
import { NotificationSettingsDialog } from "@/components/notifications/notification-settings-dialog"
import { useState } from "react"

export function NotificationsNav() {
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <>
      <NotificationBell onSettingsClick={() => setSettingsOpen(true)} />
      <NotificationSettingsDialog 
        open={settingsOpen} 
        onOpenChange={setSettingsOpen} 
      />
    </>
  )
} 