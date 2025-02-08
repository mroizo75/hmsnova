"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { formatDate } from "@/lib/utils/date"
import type { SafetyRoundFinding, FindingSeverity, FindingStatus } from "@prisma/client"
import { useEffect, useState } from "react"
import { FindingDialog } from "@/components/safety-rounds/finding-dialog"

interface Props {
  findings: Array<SafetyRoundFinding & {
    images: Array<{
      id: string
      url: string
    }>
  }>
  safetyRoundId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

const severityLabels: Record<FindingSeverity, string> = {
  LOW: 'Lav',
  MEDIUM: 'Middels',
  HIGH: 'Høy',
  CRITICAL: 'Kritisk'
}

const severityColors: Record<FindingSeverity, string> = {
  LOW: 'bg-blue-100 text-blue-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800'
}

const statusLabels: Record<FindingStatus, string> = {
  OPEN: 'Åpen',
  IN_PROGRESS: 'Under arbeid',
  RESOLVED: 'Løst',
  CLOSED: 'Lukket'
}

export function SafetyRoundFindings({ findings, safetyRoundId, open, onOpenChange }: Props) {
  const [findingsState, setFindings] = useState(findings)

  useEffect(() => {
    async function getSignedUrls() {
      const updatedFindings = await Promise.all(
        findings.map(async (finding) => ({
          ...finding,
          images: await Promise.all(
            finding.images.map(async (img) => {
              const res = await fetch('/api/storage/signed-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: img.url })
              })
              if (!res.ok) throw new Error()
              const { signedUrl } = await res.json()
              return { ...img, url: signedUrl }
            })
          )
        }))
      )
      setFindings(updatedFindings)
    }

    getSignedUrls()
  }, [findings])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Funn ({findingsState.length})</h2>
        <Button size="sm" onClick={() => onOpenChange(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Registrer funn
        </Button>
      </div>

      {findingsState.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              Ingen funn registrert
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {findingsState.map((finding) => (
            <Card key={finding.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className={severityColors[finding.severity]}>
                        {severityLabels[finding.severity]}
                      </Badge>
                      <Badge variant="outline">
                        {statusLabels[finding.status]}
                      </Badge>
                    </div>
                    
                    <p className="font-medium">{finding.description}</p>
                    
                    {finding.location && (
                      <p className="text-sm text-muted-foreground">
                        Lokasjon: {finding.location}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Registrert: {formatDate(finding.createdAt)}</span>
                      {finding.dueDate && (
                        <span>Frist: {formatDate(finding.dueDate)}</span>
                      )}
                    </div>

                    {finding.images.length > 0 && (
                      <div className="mt-4 flex gap-2">
                        {finding.images.map((image) => (
                          <img
                            key={image.id}
                            src={image.url}
                            alt="Bilde av funn"
                            className="h-20 w-20 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <FindingDialog 
        open={open}
        onOpenChange={onOpenChange}
        safetyRoundId={safetyRoundId}
      />
    </div>
  )
} 