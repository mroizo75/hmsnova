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
  RotateCcw
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
  attachments: {
    id: string
    name: string
    url: string
  }[]
}

interface HMSDocumentViewerProps {
  document: HMSDocument
}

export function HMSDocumentViewer({ document }: HMSDocumentViewerProps) {
  const router = useRouter()
  const [expandedSections, setExpandedSections] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [fontSize, setFontSize] = useState(16)
  const [showSearch, setShowSearch] = useState(false)

  // Filtrer seksjoner basert på søk
  const filteredSections = useMemo(() => {
    if (!searchQuery) return document.sections

    const query = searchQuery.toLowerCase()
    return document.sections.filter((section: any) => 
      section.title.toLowerCase().includes(query) ||
      section.content.toLowerCase().includes(query)
    )
  }, [document.sections, searchQuery])

  // Highlight søkeord i teksten
  const highlightText = (text: string) => {
    if (!searchQuery) return text
    const regex = new RegExp(`(${searchQuery})`, 'gi')
    return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>')
  }

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <button onClick={() => router.back()} className="mr-3">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-semibold">{document.title}</h1>
              <p className="text-sm text-muted-foreground">
                Sist oppdatert: {new Date(document.updatedAt).toLocaleDateString('nb-NO')}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSearch(!showSearch)}
            >
              <Search className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Søk og Zoom Controls */}
        <div className="px-4 pb-3 space-y-2">
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Søk i dokumentet..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFontSize(prev => Math.max(12, prev - 2))}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Slider
              value={[fontSize]}
              onValueChange={([value]) => setFontSize(value)}
              min={12}
              max={24}
              step={1}
              className="w-32"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFontSize(prev => Math.min(24, prev + 2))}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFontSize(16)}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <ScrollArea className="flex-1 p-4">
        {/* Description */}
        {document.description && (
          <Card className="p-4 mb-4">
            <p 
              className="text-muted-foreground"
              style={{ fontSize: `${fontSize}px` }}
              dangerouslySetInnerHTML={{ 
                __html: highlightText(document.description) 
              }}
            />
          </Card>
        )}

        {/* Sections */}
        <div className="space-y-3">
          {filteredSections.map((section: any) => (
            <Card key={section.id} className="overflow-hidden">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
              >
                <span 
                  className="font-medium"
                  style={{ fontSize: `${fontSize}px` }}
                  dangerouslySetInnerHTML={{ 
                    __html: highlightText(section.title) 
                  }}
                />
                {expandedSections.includes(section.id) ? (
                  <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>
              
              {expandedSections.includes(section.id) && (
                <div className="p-4 pt-0 border-t">
                  <div 
                    className="prose prose-sm max-w-none"
                    style={{ fontSize: `${fontSize}px` }}
                    dangerouslySetInnerHTML={{ 
                      __html: highlightText(section.content) 
                    }}
                  />
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Attachments */}
        {document.attachments.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Vedlegg</h3>
            <div className="space-y-2">
              {document.attachments.map((attachment: any) => (
                <Card key={attachment.id} className="p-3">
                  <a 
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 text-sm"
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    <Paperclip className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1">{attachment.name}</span>
                    <Download className="w-4 h-4 flex-shrink-0" />
                  </a>
                </Card>
              ))}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  )
} 