"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils/date"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle } from "lucide-react"

interface Finding {
  id: string
  description: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED'
  createdAt: string
  measures: Array<{
    id: string
    description: string
    status: string
    dueDate?: string | null
    completedAt?: string | null
  }>
  location?: string
  checklistItem: {
    category: string
    question: string
  }
}

interface FindingsListProps {
  findings: Array<any>
  onUpdate?: (updatedFinding: any) => void
  onAddMeasure?: (findingId: string) => void
}

export function FindingsList({ findings, onUpdate, onAddMeasure }: FindingsListProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'LOW': return 'bg-blue-100 text-blue-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'HIGH': return 'bg-red-100 text-red-800'
      case 'CRITICAL': return 'bg-red-600 text-white'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="default">Fullført</Badge>
      case 'IN_PROGRESS':
        return <Badge variant="secondary">Under arbeid</Badge>
      case 'OPEN':
      default:
        return <Badge variant="destructive">Åpen</Badge>
    }
  }

  if (findings.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Ingen funn registrert
      </div>
    )
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
              {getStatusBadge(finding.status)}
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
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Tiltak</h4>
                  {onAddMeasure && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAddMeasure(finding.id)}
                    >
                      Legg til tiltak
                    </Button>
                  )}
                </div>
                
                {finding.measures.length > 0 ? (
                  <ul className="space-y-2">
                    {finding.measures.map((measure: any) => (
                      <li key={measure.id} className="text-sm">
                        <div className="flex items-center justify-between">
                          <span>{measure.description}</span>
                          {measure.status === 'COMPLETED' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          )}
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