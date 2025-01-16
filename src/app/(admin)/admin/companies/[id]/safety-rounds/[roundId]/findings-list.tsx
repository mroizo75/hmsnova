"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils/date"

interface Finding {
  id: string
  description: string
  severity: string
  status: string
  location?: string | null
  createdAt: string
  checklistItem: {
    category: string
    question: string
  }
  measures: Array<{
    id: string
    description: string
    status: string
    dueDate?: string | null
    completedAt?: string | null
  }>
}

interface Props {
  findings: Finding[]
}

export function FindingsList({ findings }: Props) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'LOW': return 'bg-yellow-100 text-yellow-800'
      case 'MEDIUM': return 'bg-orange-100 text-orange-800'
      case 'HIGH': return 'bg-red-100 text-red-800'
      case 'CRITICAL': return 'bg-red-600 text-white'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-4">
      {findings.map(finding => (
        <Card key={finding.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <Badge className={getSeverityColor(finding.severity)}>
                  {finding.severity}
                </Badge>
                <CardTitle className="text-lg">
                  {finding.checklistItem.category}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {finding.checklistItem.question}
                </p>
              </div>
              <Badge variant={finding.status === 'OPEN' ? 'destructive' : 'outline'}>
                {finding.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-1">Beskrivelse av funn</h4>
                <p className="text-sm">{finding.description}</p>
              </div>
              
              {finding.location && (
                <div>
                  <h4 className="font-medium mb-1">Lokasjon</h4>
                  <p className="text-sm">{finding.location}</p>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-2">Tiltak</h4>
                {finding.measures.length > 0 ? (
                  <ul className="space-y-2">
                    {finding.measures.map(measure => (
                      <li key={measure.id} className="text-sm">
                        <div className="flex items-center justify-between">
                          <span>{measure.description}</span>
                          <Badge variant={measure.status === 'COMPLETED' ? 'default' : 'outline'}>
                            {measure.status}
                          </Badge>
                        </div>
                        {measure.dueDate && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Frist: {formatDate(measure.dueDate)}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Ingen tiltak registrert
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 