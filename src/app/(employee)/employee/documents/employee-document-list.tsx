"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"
import { formatDate } from "@/lib/utils/date"
import { formatFileSize } from "@/lib/utils/format"
import Link from "next/link"
import { toast } from "sonner"

interface DocumentListProps {
  documents: any[] // Type dette bedre basert på Prisma-modellen
}

export function EmployeeDocumentList({ documents }: DocumentListProps) {
  const handleDownload = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/download`)
      if (!response.ok) throw new Error('Kunne ikke laste ned dokument')
      
      const { url } = await response.json()
      window.open(url, '_blank')
    } catch (error) {
      toast.error('Kunne ikke laste ned dokument')
    }
  }

  if (documents.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          Ingen dokumenter tilgjengelig
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <Link key={doc.id} href={`/employee/documents/${doc.id}`}>
          <Card className="hover:bg-gray-50 transition-colors">
            <div className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{doc.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="truncate max-w-[120px]">
                      {doc.category.name}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {doc.description && (
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {doc.description}
                </p>
              )}

              <div className="mt-3 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {formatDate(doc.updatedAt)}
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="ml-2 flex-shrink-0"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleDownload(doc.id)
                  }}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
} 