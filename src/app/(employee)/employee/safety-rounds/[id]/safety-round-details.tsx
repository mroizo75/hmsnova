"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils/date"
import { useState } from "react"
import { SafetyRoundFindings } from "@/components/safety-rounds/safety-round-findings"
import type { SafetyRound } from "@prisma/client"
import { UpdateStatusDialog } from "@/app/(dashboard)/dashboard/safety-rounds/[id]/update-status-dialog"
import { Play } from "lucide-react"
import { EmployeeSafetyRoundForm } from "./employee-safety-round-form"

interface Props {
  safetyRound: SafetyRound & {
    template: {
      id: string
      name: string
    } | null
    assignedUser: {
      id: string
      name: string | null
      email: string
      image: string | null
    } | null
    participants: Array<{
      user: {
        id: string
        name: string | null
        email: string
        image: string | null
      }
    }>
    findings: Array<{
      id: string
      images: Array<{
        id: string
        url: string
      }>
    }>
    checklistItems: Array<{
      id: string
      category: string
      question: string
      order: number
    }>
    images: Array<{
      id: string
      url: string
      caption: string | null
    }>
  }
}

export function SafetyRoundDetails({ safetyRound }: Props) {
  const [isUpdateStatusOpen, setIsUpdateStatusOpen] = useState(false)
  const [isStarted, setIsStarted] = useState(false)

  if (isStarted) {
    return <EmployeeSafetyRoundForm safetyRound={safetyRound} />
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-xl font-semibold">{safetyRound.title}</h1>
            <p className="text-muted-foreground mt-1">{safetyRound.description}</p>
          </div>
          <Badge>{safetyRound.status}</Badge>
        </div>

        <Button 
          className="w-full" 
          onClick={() => setIsStarted(true)}
          disabled={safetyRound.status !== 'SCHEDULED'}
        >
          <Play className="w-4 h-4 mr-2" />
          Start vernerunde
        </Button>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4">Detaljer</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                <dd>
                  <Badge>{safetyRound.status}</Badge>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Ansvarlig</dt>
                <dd>{safetyRound.assignedUser?.name || safetyRound.assignedUser?.email}</dd>
              </div>
              {safetyRound.scheduledDate && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Planlagt dato</dt>
                  <dd>{formatDate(safetyRound.scheduledDate)}</dd>
                </div>
              )}
              {safetyRound.dueDate && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Frist</dt>
                  <dd>{formatDate(safetyRound.dueDate)}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4">Deltakere</h2>
            <ul className="space-y-2">
              {safetyRound.participants.map((participant) => (
                <li key={participant.user.id}>
                  {participant.user.name || participant.user.email}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <SafetyRoundFindings 
        findings={safetyRound.findings as any} 
        safetyRoundId={safetyRound.id} 
        open={false}
        onOpenChange={() => {}}
      />

      <UpdateStatusDialog 
        open={isUpdateStatusOpen}
        onOpenChange={setIsUpdateStatusOpen}
        safetyRound={safetyRound}
      />
    </div>
  )
} 