"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { History } from "lucide-react"
import { useState } from "react"
import { formatDate } from "@/lib/utils/date"

interface Release {
  id: string
  version: number
  changes: string
  reason: string
  approvedBy: string
  approvedAt: string
  createdAt: string
}

interface VersionHistoryDialogProps {
  handbookId: string
  currentVersion: number
}

export function VersionHistoryDialog({ handbookId, currentVersion }: VersionHistoryDialogProps) {
  const [open, setOpen] = useState(false)
  const [releases, setReleases] = useState<Release[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadReleases() {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/hms-handbook/${handbookId}/releases`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || "Kunne ikke hente versjonshistorikk")
      }

      setReleases(data)
    } catch (error) {
      console.error("Error loading releases:", error)
      setError(error instanceof Error ? error.message : "Kunne ikke hente versjonshistorikk")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen)
      if (isOpen) {
        loadReleases()
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <History className="mr-2 h-4 w-4" />
          Versjonshistorikk
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Versjonshistorikk</DialogTitle>
          <DialogDescription>
            Oversikt over alle versjoner av HMS-håndboken
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-8">
            {loading ? (
              <div className="text-center py-4">Laster versjonshistorikk...</div>
            ) : error ? (
              <div className="text-center py-4 text-destructive">
                {error}
              </div>
            ) : releases.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                Ingen tidligere versjoner funnet
              </div>
            ) : (
              releases.map((release, index) => (
                <div key={release.id} className="relative pb-8">
                  {index < releases.length - 1 && (
                    <div className="absolute left-4 top-8 -bottom-8 w-0.5 bg-border" />
                  )}
                  <div className="relative flex items-start space-x-4">
                    <div className="relative">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        v{release.version}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Versjon {release.version}</h3>
                        <time className="text-sm text-muted-foreground">
                          {formatDate(release.createdAt)}
                        </time>
                      </div>
                      <div className="mt-2 space-y-4">
                        <div>
                          <h4 className="text-sm font-medium">Endringer</h4>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {release.changes}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Årsak</h4>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {release.reason}
                          </p>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <span>Godkjent av {release.approvedBy}</span>
                          <span className="mx-2">•</span>
                          <time>{formatDate(release.approvedAt)}</time>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
} 