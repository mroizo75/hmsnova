'use client'

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { nb } from "date-fns/locale"
import { ApproveHMSChangeModal } from "./approve-hms-change-modal"

interface HMSChange {
  id: string
  title: string
  description: string
  status: string
  priority: string
  dueDate?: string | null
  createdAt: string
  createdBy: string
  assignedTo?: string | null
  approvedBy?: string | null
  approvedAt?: string | null
  source: {
    type: "DEVIATION" | "RISK_ASSESSMENT"
    id: string
    title: string
  }
}

export function HMSChangeList({ changes }: { changes: HMSChange[] }) {
  const [selectedChange, setSelectedChange] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      {changes.map((change) => (
        <Card key={change.id} className="p-4">
          <div className="flex flex-col space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="font-medium">{change.title}</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge>{change.status}</Badge>
                  <Badge variant={
                    change.priority === "HIGH" || change.priority === "CRITICAL" 
                      ? "destructive" 
                      : "outline"
                  }>
                    {change.priority}
                  </Badge>
                  <Badge variant="secondary">
                    {change.source.type === "DEVIATION" ? "Avvik" : "Risikovurdering"}
                  </Badge>
                </div>
              </div>
              {change.status !== "APPROVED" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedChange(change.id)}
                >
                  Godkjenn endring
                </Button>
              )}
            </div>

            <p className="text-sm text-muted-foreground">{change.description}</p>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Kilde</p>
                <p>{change.source.title}</p>
              </div>
              {change.dueDate && (
                <div>
                  <p className="font-medium">Frist</p>
                  <p>{format(new Date(change.dueDate), "PPP", { locale: nb })}</p>
                </div>
              )}
              {change.assignedTo && (
                <div>
                  <p className="font-medium">Ansvarlig</p>
                  <p>{change.assignedTo}</p>
                </div>
              )}
              <div>
                <p className="font-medium">Opprettet</p>
                <p>{format(new Date(change.createdAt), "PPP", { locale: nb })}</p>
              </div>
            </div>

            {change.approvedBy && (
              <div className="pt-2 border-t">
                <p className="text-sm">
                  <span className="font-medium">Godkjent av:</span>{" "}
                  {change.approvedBy} ({format(new Date(change.approvedAt!), "PPP", { locale: nb })})
                </p>
              </div>
            )}
          </div>
        </Card>
      ))}

      <ApproveHMSChangeModal
        isOpen={!!selectedChange}
        onClose={() => setSelectedChange(null)}
        changeId={selectedChange || ""}
      />
    </div>
  )
} 