"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils/date"
import { SelectHMSChangesDialog } from "./select-hms-changes-dialog"

interface Change {
  id: string
  title: string
  description: string
  status: string
  implementedAt: Date | null
  createdAt: Date
  deviations: Array<{
    deviation: {
      id: string
      title: string
      description: string
    }
  }>
  riskAssessments: Array<{
    riskAssessment: {
      id: string
      title: string
      description: string
    }
  }>
}

interface Props {
  sectionId: string
  changes: Change[]
}

export function HMSChangesOverview({ sectionId, changes }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">HMS-endringer</h2>
        <SelectHMSChangesDialog sectionId={sectionId} />
      </div>

      {changes.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Ingen HMS-endringer er knyttet til denne seksjonen
        </p>
      ) : (
        <div className="space-y-4">
          {changes.map((change) => (
            <Card key={change.id} className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{change.title}</h3>
                <Badge variant={change.status === 'OPEN' ? 'default' : 'secondary'}>
                  {change.status === 'OPEN' ? 'Aktiv' : change.status}
                </Badge>
              </div>
              
              <p className="mt-2 text-sm text-muted-foreground">
                {change.description}
              </p>

              <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium">Opprettet:</span>{" "}
                  {formatDate(change.createdAt)}
                </div>
                {change.implementedAt && (
                  <div>
                    <span className="font-medium">Implementert:</span>{" "}
                    {formatDate(change.implementedAt)}
                  </div>
                )}
              </div>

              {/* Relaterte elementer */}
              <div className="mt-4 space-y-3">
                {change.deviations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Relaterte avvik:</h4>
                    <ul className="space-y-2">
                      {change.deviations.map(({ deviation }) => (
                        <li key={deviation.id} className="text-sm">
                          • {deviation.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {change.riskAssessments.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">
                      Relaterte risikovurderinger:
                    </h4>
                    <ul className="space-y-2">
                      {change.riskAssessments.map(({ riskAssessment }) => (
                        <li key={riskAssessment.id} className="text-sm">
                          • {riskAssessment.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 