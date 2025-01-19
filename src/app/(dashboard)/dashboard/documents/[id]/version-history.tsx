"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils/date"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, Clock } from "lucide-react"

interface Version {
  id: string
  version: number
  fileName: string
  fileSize: number
  createdAt: string
  createdBy: {
    name: string | null
    email: string
  }
  comment?: string | null
}

interface VersionHistoryProps {
  versions: Version[]
  onDownload?: (versionId: string) => Promise<void>
}

export function VersionHistory({ versions, onDownload }: VersionHistoryProps) {
  if (!versions.length) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-muted-foreground">
          Ingen versjonshistorikk tilgjengelig
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Versjonshistorikk</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {versions.map((version) => (
          <div
            key={version.id}
            className="flex items-start justify-between border-b last:border-0 pb-4 last:pb-0"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">Versjon {version.version}</span>
                {version.version === versions[0].version && (
                  <Badge variant="secondary">Gjeldende</Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {version.fileName}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  Lastet opp {formatDate(version.createdAt)} av{" "}
                  {version.createdBy.name || version.createdBy.email}
                </span>
              </div>
              {version.comment && (
                <p className="text-sm mt-2">{version.comment}</p>
              )}
            </div>
            {onDownload && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownload(version.id)}
              >
                <Download className="h-4 w-4 mr-2" />
                Last ned
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
} 