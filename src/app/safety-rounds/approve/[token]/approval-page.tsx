'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils/date"
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Props {
  approval: {
    token: string
    status: string
    expiresAt: string
    safetyRound: {
      id: string
      title: string
      description: string | null
      completedAt: string
      findings: Array<{
        id: string
        description: string
        severity: string
        status: string
        measures: Array<{
          description: string
          completedAt: string | null
        }>
      }>
      checklistItems: Array<{
        category: string
        question: string
        response: string
        comment: string | null
      }>
    }
  }
}

export function ApprovalPage({ approval }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleApprove = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/safety-rounds/approve/${approval.token}`, {
        method: 'POST'
      })

      if (!response.ok) throw new Error('Kunne ikke godkjenne rapport')

      toast.success('Rapport godkjent')
      router.refresh()
    } catch (error) {
      console.error('Error approving report:', error)
      toast.error('Kunne ikke godkjenne rapport')
    } finally {
      setLoading(false)
    }
  }

  // Grupper sjekkpunkter etter kategori
  const checklistByCategory = approval.safetyRound.checklistItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, typeof approval.safetyRound.checklistItems>)

  if (approval.status !== 'PENDING') {
    return (
      <div className="container max-w-4xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>Rapport allerede behandlet</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Denne godkjenningslenken er ikke lenger gyldig.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (new Date(approval.expiresAt) < new Date()) {
    return (
      <div className="container max-w-4xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>Lenken er utløpt</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Denne godkjenningslenken er utløpt. Be om en ny lenke.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-8 space-y-6 bg-white rounded-lg p-4">
      <Card>
        <CardHeader>
          <CardTitle>{approval.safetyRound.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {approval.safetyRound.description && (
              <p className="text-muted-foreground">
                {approval.safetyRound.description}
              </p>
            )}
            <div>
              <p className="font-medium">Fullført dato</p>
              <p>{formatDate(approval.safetyRound.completedAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sjekkliste</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(checklistByCategory).map(([category, items]) => (
              <div key={category}>
                <h3 className="font-semibold mb-3">{category}</h3>
                <div className="space-y-4">
                  {items.map(item => (
                    <div key={item.question} className="border p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={
                          item.response === 'YES' ? 'success' :
                          item.response === 'NO' ? 'destructive' :
                          'secondary'
                        }>
                          {item.response === 'YES' ? 'Ja' :
                           item.response === 'NO' ? 'Nei' :
                           'Ikke relevant'}
                        </Badge>
                        <span className="font-medium">{item.question}</span>
                      </div>
                      {item.comment && (
                        <div className="ml-4 mt-2">
                          <p className="text-sm text-muted-foreground">
                            Kommentar: {item.comment}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Funn og tiltak</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {approval.safetyRound.findings.map(finding => (
              <div key={finding.id} className="border p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={
                    finding.severity === 'HIGH' ? 'destructive' :
                    finding.severity === 'MEDIUM' ? 'warning' :
                    'secondary'
                  }>
                    {finding.severity}
                  </Badge>
                  <span className="font-medium">{finding.description}</span>
                </div>
                {finding.measures.length > 0 && (
                  <div className="ml-4">
                    <p className="text-sm font-medium mb-1">Tiltak:</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {finding.measures.map(measure => (
                        <li key={measure.description}>
                          {measure.description}
                          {measure.completedAt && (
                            <span className="text-green-600 ml-2">
                              (Utført: {formatDate(measure.completedAt)})
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={handleApprove}
          disabled={loading}
        >
          {loading ? 'Godkjenner...' : 'Godkjenn rapport'}
        </Button>
      </div>
    </div>
  )
} 