"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils/date"
import { AlertTriangle, CheckCircle, AlertCircle } from "lucide-react"
import { FindingSeverity, SafetyRound } from "@prisma/client"

interface Props {
  report: SafetyRound & {
    findings: Array<{
      id: string
      severity: FindingSeverity
      description: string
      location: string | null
      status: string
      images: Array<{
        id: string
        url: string
      }>
      measures: Array<{
        id: string
        description: string
        dueDate: Date | null
        completedAt: Date | null
        assignedTo: {
          name: string | null
          email: string
        } | null
      }>
    }>
    checklistItems: Array<{
      id: string
      category: string
      question: string
      response: string | null
      comment: string | null
      findings: Array<any>
      images: Array<{
        id: string
        url: string
      }>
    }>
    assignedUser: {
      name: string | null
      email: string
    } | null
    participants: Array<{
      user: {
        name: string | null
        email: string
      }
    }>
  }
}

const severityIcons = {
  LOW: <CheckCircle className="h-5 w-5 text-blue-500" />,
  MEDIUM: <AlertCircle className="h-5 w-5 text-yellow-500" />,
  HIGH: <AlertTriangle className="h-5 w-5 text-red-500" />,
  CRITICAL: <AlertTriangle className="h-5 w-5 text-red-700" />
}

export function SafetyRoundReportDetails({ report }: Props) {
  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{report.title}</h1>
          <p className="text-muted-foreground">
            Fullført {report.completedAt ? formatDate(report.completedAt) : 'Ikke fullført'}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Detaljer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium">Ansvarlig</h3>
              <p className="text-sm text-muted-foreground">
                {report.assignedUser?.name || report.assignedUser?.email}
              </p>
            </div>
            <div>
              <h3 className="font-medium">Deltakere</h3>
              <ul className="text-sm text-muted-foreground">
                {report.participants.map(({ user }) => (
                  <li key={user.email}>{user.name || user.email}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistikk</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-muted-foreground">Antall sjekkpunkter</dt>
                <dd className="text-2xl font-bold">{report.checklistItems.length}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Antall funn</dt>
                <dd className="text-2xl font-bold">{report.findings.length}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Funn</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {report.findings.map((finding) => (
              <div key={finding.id} className="border-b pb-6 last:border-0">
                <div className="flex items-start gap-2">
                  {severityIcons[finding.severity]}
                  <div>
                    <p className="font-medium">{finding.description}</p>
                    {finding.location && (
                      <p className="text-sm text-muted-foreground">
                        Lokasjon: {finding.location}
                      </p>
                    )}
                  </div>
                </div>

                {finding.measures.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Tiltak</h4>
                    <ul className="space-y-2">
                      {finding.measures.map((measure) => (
                        <li key={measure.id} className="text-sm">
                          <p>{measure.description}</p>
                          {measure.assignedTo && (
                            <p className="text-muted-foreground">
                              Ansvarlig: {measure.assignedTo.name || measure.assignedTo.email}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {finding.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {finding.images.map((image) => (
                      <img
                        key={image.id}
                        src={image.url}
                        alt="Bilde av funn"
                        className="rounded-lg object-cover aspect-square"
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 