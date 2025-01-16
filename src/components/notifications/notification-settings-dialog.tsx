"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  emailDigestFrequency: string
  deviationCreated: boolean
  deviationAssigned: boolean
  sjaCreated: boolean
  sjaAssigned: boolean
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NotificationSettingsDialog({ open, onOpenChange }: Props) {
  const [settings, setSettings] = useState<NotificationSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (open) {
      fetchSettings()
    }
  }, [open])

  async function fetchSettings() {
    try {
      const response = await fetch('/api/user/notification-settings')
      if (!response.ok) throw new Error('Kunne ikke hente innstillinger')
      const data = await response.json()
      setSettings(data)
    } catch (error) {
      toast.error('Kunne ikke hente varslingsinnstillinger')
    } finally {
      setLoading(false)
    }
  }

  async function updateSettings(updates: Partial<NotificationSettings>) {
    try {
      const response = await fetch('/api/user/notification-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (!response.ok) throw new Error('Kunne ikke oppdatere innstillinger')
      
      setSettings(prev => prev ? { ...prev, ...updates } : null)
      toast.success('Innstillinger oppdatert')
    } catch (error) {
      toast.error('Kunne ikke oppdatere innstillinger')
    }
  }

  if (!settings) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Varslingsinnstillinger</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications">E-postvarsling</Label>
              <Switch
                id="email-notifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => 
                  updateSettings({ emailNotifications: checked })
                }
              />
            </div>

            {settings.emailNotifications && (
              <div className="space-y-2">
                <Label>E-postfrekvens</Label>
                <Select
                  value={settings.emailDigestFrequency}
                  onValueChange={(value) => 
                    updateSettings({ emailDigestFrequency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INSTANT">Umiddelbart</SelectItem>
                    <SelectItem value="DAILY">Daglig oppsummering</SelectItem>
                    <SelectItem value="WEEKLY">Ukentlig oppsummering</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Varslingstyper</h4>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="deviation-created">Nye avvik</Label>
                <Switch
                  id="deviation-created"
                  checked={settings.deviationCreated}
                  onCheckedChange={(checked) => 
                    updateSettings({ deviationCreated: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="deviation-assigned">Tildelte avvik</Label>
                <Switch
                  id="deviation-assigned"
                  checked={settings.deviationAssigned}
                  onCheckedChange={(checked) => 
                    updateSettings({ deviationAssigned: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="sja-created">Nye SJA</Label>
                <Switch
                  id="sja-created"
                  checked={settings.sjaCreated}
                  onCheckedChange={(checked) => 
                    updateSettings({ sjaCreated: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="sja-assigned">Tildelte SJA</Label>
                <Switch
                  id="sja-assigned"
                  checked={settings.sjaAssigned}
                  onCheckedChange={(checked) => 
                    updateSettings({ sjaAssigned: checked })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 