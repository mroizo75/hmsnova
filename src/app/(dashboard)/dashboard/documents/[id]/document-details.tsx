"use client"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { formatDate } from "@/lib/utils/date"
import { formatFileSize } from "@/lib/utils/format"
import { Download, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

interface DocumentDetailsProps {
  document: any // Bruk riktig type fra Prisma
}

export function DocumentDetails({ document }: DocumentDetailsProps) {
  const router = useRouter()

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
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Tilbake
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{document.name}</CardTitle>
              <Badge variant="outline" className="mt-2">
                {document.category.name}
              </Badge>
            </div>
            <Button onClick={() => handleDownload(document.versions[0].id)}>
              <Download className="h-4 w-4 mr-2" />
              Last ned
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {document.description && (
            <div>
              <h3 className="font-medium mb-2">Beskrivelse</h3>
              <p className="text-muted-foreground">{document.description}</p>
            </div>
          )}

          <div>
            <h3 className="font-medium mb-2">Versjonshistorikk</h3>
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
                    onClick={() => handleDownload(version.id)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Last ned
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 