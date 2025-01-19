'use client'

import { useState, useMemo } from "react"
import { 
  ChevronLeft, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  Paperclip,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronRight
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"

interface HMSDocument {
  id: string
  title: string
  description?: string
  version: number
  published: boolean
  createdAt: Date
  updatedAt: Date
  sections: {
    id: string
    title: string
    content: string
    order: number
  }[]
  attachments?: {
    id: string
    name: string
    url: string
  }[]
}

interface HMSDocumentViewerProps {
  documents: HMSDocument[]
}

export function HMSDocumentViewer({ documents }: HMSDocumentViewerProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [fontSize, setFontSize] = useState(16)
  const [showSearch, setShowSearch] = useState(false)

  // Filtrer dokumenter basert på søk
  const filteredDocs = useMemo(() => {
    if (!searchQuery) return documents

    const query = searchQuery.toLowerCase()
    return documents.filter(doc => 
      doc.title.toLowerCase().includes(query) ||
      doc.description?.toLowerCase().includes(query) ||
      doc.sections.some(section => 
        section.title.toLowerCase().includes(query) ||
        section.content.toLowerCase().includes(query)
      )
    )
  }, [documents, searchQuery])

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <button onClick={() => router.back()} className="mr-3">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold">HMS Håndbok</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSearch(!showSearch)}
          >
            <Search className="w-5 h-5" />
          </Button>
        </div>

        {showSearch && (
          <div className="px-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Søk i HMS dokumenter..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {filteredDocs.map((doc) => (
            <Card 
              key={doc.id} 
              className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => router.push(`/employee/hms-handbook/${doc.id}`)}
            >
              <div className="flex items-center space-x-4">
                <div className="p-2 rounded-lg bg-blue-100">
                  <ChevronRight className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium" style={{ fontSize: `${fontSize}px` }}>
                    {doc.title}
                  </h3>
                  {doc.description && (
                    <p 
                      className="text-sm text-muted-foreground line-clamp-2"
                      style={{ fontSize: `${fontSize}px` }}
                    >
                      {doc.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Sist oppdatert: {new Date(doc.updatedAt).toLocaleDateString('nb-NO')}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
} 