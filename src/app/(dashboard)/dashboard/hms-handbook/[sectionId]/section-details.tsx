import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils/date"
import { HMSSection, HMSChange } from "@prisma/client"

interface SectionDetailsProps {
  section: HMSSection & {
    changes: (HMSChange & {
      deviations: {
        deviation: {
          id: string
          title: string
          description: string
        }
      }[]
      riskAssessments: {
        riskAssessment: {
          id: string
          title: string
          description: string
        }
      }[]
    })[]
  }
}

export function SectionDetails({ section }: SectionDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="prose max-w-none">
        <h1>{section.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: section.content as string }} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Endringshistorikk</CardTitle>
          <CardDescription>
            Oversikt over endringer i denne seksjonen basert på avvik og risikovurderinger
          </CardDescription>
        </CardHeader>
        <CardContent>
          {section.changes.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Ingen endringer er registrert for denne seksjonen ennå.
            </p>
          ) : (
            <div className="space-y-4">
              {section.changes.map((change) => (
                <div key={change.id} className="border p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{change.title}</h3>
                    <Badge variant={change.status === 'OPEN' ? 'default' : 'secondary'}>
                      {change.status === 'OPEN' ? 'Tilknyttet' : change.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{change.description}</p>
                  <div className="mt-4 space-y-2">
                    {change.deviations.length > 0 && (
                      <div>
                        <p className="text-sm font-medium">Relaterte avvik:</p>
                        <ul className="list-disc list-inside text-sm">
                          {change.deviations.map(({ deviation }: { deviation: any }) => (
                            <li key={deviation.id}>{deviation.title}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {change.riskAssessments.length > 0 && (
                      <div>
                        <p className="text-sm font-medium">Relaterte risikovurderinger:</p>
                        <ul className="list-disc list-inside text-sm">
                          {change.riskAssessments.map(({ riskAssessment }: { riskAssessment: any }) => (
                            <li key={riskAssessment.id}>{riskAssessment.title}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    Opprettet: {formatDate(change.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 