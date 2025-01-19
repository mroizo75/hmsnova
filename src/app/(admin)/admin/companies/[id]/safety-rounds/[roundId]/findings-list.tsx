"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils/date"
import { SafetyRoundFinding } from "../types"

interface FindingsListProps {
  findings: SafetyRoundFinding[]
}

export function FindingsList({ findings }: FindingsListProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'LOW':
        return 'bg-yellow-100 text-yellow-800'
      case 'MEDIUM':
        return 'bg-orange-100 text-orange-800'
      case 'HIGH':
        return 'bg-red-100 text-red-800'
      case 'CRITICAL':
        return 'bg-red-200 text-red-900'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-4">
      {findings.map((finding) => (
        <Card key={finding.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {finding.description}
              </CardTitle>
              <Badge className={getSeverityColor(finding.severity)}>
                {finding.severity}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p>{finding.status}</p>
              </div>
              {finding.dueDate && (
                <div>
                  <p className="text-sm text-muted-foreground">Frist</p>
                  <p>{formatDate(finding.dueDate)}</p>
                </div>
              )}
            </div>

            {finding.measures.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Tiltak</h4>
                <div className="space-y-2">
                  {finding.measures.map((measure) => (
                    <div key={measure.id} className="p-3 bg-muted rounded-md">
                      <p>{measure.description}</p>
                      <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
                        <span>Status: {measure.status}</span>
                        <span>Prioritet: {measure.priority}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 