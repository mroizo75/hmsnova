"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils/date"
import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"
import { FindingsList } from "./findings-list"
import { AddFindingDialog } from "./add-finding-dialog"
import { UpdateStatusDialog } from "./update-status-dialog"
import { useState } from "react"

interface SafetyRoundDetailsProps {
  safetyRound: any // Utvid dette med riktig type
}

export function SafetyRoundDetails({ safetyRound: initialData }: SafetyRoundDetailsProps) {
  const [safetyRound, setSafetyRound] = useState(initialData)

  function getStatusBadge(status: string) {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="success">Fullført</Badge>
      case 'IN_PROGRESS':
        return <Badge variant="warning">Pågår</Badge>
      case 'DRAFT':
        return <Badge variant="secondary">Utkast</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/safety-rounds">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{safetyRound.title}</h1>
          {getStatusBadge(safetyRound.status)}
        </div>
        <div className="flex gap-2">
          <AddFindingDialog
            safetyRoundId={safetyRound.id}
            onSuccess={(newFinding) => {
              setSafetyRound({
                ...safetyRound,
                findings: [...safetyRound.findings, newFinding]
              })
            }}
          />
          <UpdateStatusDialog
            safetyRound={safetyRound}
            onSuccess={(updatedRound) => {
              setSafetyRound(updatedRound)
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Funn og observasjoner</CardTitle>
          </CardHeader>
          <CardContent>
            <FindingsList 
              findings={safetyRound.findings}
              onUpdate={(updatedFinding) => {
                setSafetyRound({
                  ...safetyRound,
                  findings: safetyRound.findings.map((f: any) =>
                    f.id === updatedFinding.id ? updatedFinding : f
                  )
                })
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detaljer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {safetyRound.description && (
              <div>
                <div className="font-medium">Beskrivelse</div>
                <div className="text-sm text-muted-foreground">
                  {safetyRound.description}
                </div>
              </div>
            )}
            <div>
              <div className="font-medium">Status</div>
              <div className="text-sm text-muted-foreground">
                {getStatusBadge(safetyRound.status)}
              </div>
            </div>
            {safetyRound.dueDate && (
              <div>
                <div className="font-medium">Frist</div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(safetyRound.dueDate)}
                </div>
              </div>
            )}
            <div>
              <div className="font-medium">Antall funn</div>
              <div className="text-sm text-muted-foreground">
                {safetyRound.findings.length}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 