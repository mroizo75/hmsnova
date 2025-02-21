"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils/date"
import { formatFileSize } from "@/lib/utils/format"
import { Download, FileText } from "lucide-react"
import { toast } from "sonner"

interface DocumentDetailsProps {
  document: any // Type dette bedre basert på Prisma-modellen
}

export function EmployeeDocumentDetails({ document }: DocumentDetailsProps) {
  const handleDownload = async (versionId: string) => {
    try {
      const response = await fetch(`/api/documents/${document.id}/download`)
      if (!response.ok) throw new Error('Kunne ikke laste ned dokument')
      
      const { url } = await response.json()
      window.open(url, '_blank')
    } catch (error) {
      toast.error('Kunne ikke laste ned dokument')
    }
  }

  return (
    <div className="space-y-6">
      {/* Hovedinformasjon */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{document.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">
                  {document.category.name}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Oppdatert {formatDate(document.updatedAt)}
                </span>
              </div>
            </div>
          </div>

          {document.description && (
            <p className="text-muted-foreground mb-4">
              {document.description}
            </p>
          )}

          <Button 
            className="w-full"
            onClick={() => handleDownload(document.versions[0].id)}
          >
            <Download className="h-4 w-4 mr-2" />
            Last ned siste versjon
          </Button>
        </CardContent>
      </Card>

      {/* Versjonshistorikk */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Versjonshistorikk</h3>
          <div className="space-y-4">
            {document.versions.map((version: any) => (
              <div 
                key={version.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <div className="font-medium">
                    Versjon {version.version}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Lastet opp av {version.uploadedBy.name || version.uploadedBy.email}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(version.createdAt)} • {formatFileSize(version.fileSize)}
                  </div>
                </div>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(version.id)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Last ned
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Detaljer</h3>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Filtype</dt>
              <dd>{document.type}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Opprettet av</dt>
              <dd>{document.user.name || document.user.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Opprettet dato</dt>
              <dd>{formatDate(document.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Sist oppdatert</dt>
              <dd>{formatDate(document.updatedAt)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  )
} 