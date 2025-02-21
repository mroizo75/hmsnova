"use client"

import { formatDate } from "@/lib/utils/date"
import { formatFileSize } from "@/lib/utils/format"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, Eye, FileText, Folder } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "react-hot-toast"

interface DocumentListProps {
  documents: any[]
}

export function DocumentList({ documents }: DocumentListProps) {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = category === "all" || doc.category?.name === category
    return matchesSearch && matchesCategory
  })

  const categories = Array.from(new Set(documents.map(doc => doc.category?.name).filter(Boolean)))

  const handleDownload = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/download`)
      if (!response.ok) throw new Error('Kunne ikke laste ned dokument')
      
      const { url } = await response.json()
      
      // Åpne nedlastingslenken i ny fane
      window.open(url, '_blank')
    } catch (error) {
      toast.error('Kunne ikke laste ned dokument')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Input
          placeholder="Søk i dokumenter..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Velg kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle kategorier</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredDocuments.map((doc) => (
          <Card key={doc.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium">
                  {doc.name}
                </CardTitle>
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardDescription>
                Lastet opp av {doc.user.name || doc.user.email}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="secondary">{doc.category?.name || 'Ukategorisert'}</Badge>
                  <span>•</span>
                  <span>{formatDate(doc.updatedAt)}</span>
                  <span>•</span>
                  <span>{formatFileSize(doc.versions[0]?.size || 0)}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/documents/${doc.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      Åpne
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownload(doc.id)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Last ned
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 