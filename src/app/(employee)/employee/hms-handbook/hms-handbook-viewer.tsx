"use client"

import { Card } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useState } from "react"

interface HMSHandbookViewerProps {
  handbook: {
    title: string
    description?: string | null
    sections: Array<{
      id: string
      title: string
      content: string
      subsections: Array<{
        id: string
        title: string
        content: string
      }>
    }>
  }
}

export function HMSHandbookViewer({ handbook }: HMSHandbookViewerProps) {
  const [searchQuery, setSearchQuery] = useState("")

  // Søkefunksjon
  const filteredSections = searchQuery.trim().length >= 2
    ? findAllMatchingSections(handbook.sections, searchQuery.toLowerCase())
    : handbook.sections

  function findAllMatchingSections(sections: any[], query: string) {
    return sections.filter(section => 
      section.title.toLowerCase().includes(query) ||
      section.content.toLowerCase().includes(query) ||
      section.subsections.some((sub: any) =>
        sub.title.toLowerCase().includes(query) ||
        sub.content.toLowerCase().includes(query)
      )
    )
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Søk i HMS-håndboken..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card className="p-6">
        <Accordion type="single" collapsible className="space-y-4">
          {filteredSections.map((section) => (
            <AccordionItem key={section.id} value={section.id}>
              <AccordionTrigger className="text-lg font-medium hover:no-underline">
                {section.title}
              </AccordionTrigger>
              <AccordionContent className="pt-4 space-y-6">
                <div 
                  className="prose max-w-none" 
                  dangerouslySetInnerHTML={{ __html: section.content }} 
                />
                
                {section.subsections.length > 0 && (
                  <Accordion type="single" collapsible className="mt-4">
                    {section.subsections.map((subsection: any) => (
                      <AccordionItem key={subsection.id} value={subsection.id}>
                        <AccordionTrigger className="text-base hover:no-underline">
                          {subsection.title}
                        </AccordionTrigger>
                        <AccordionContent className="pt-4">
                          <div 
                            className="prose max-w-none" 
                            dangerouslySetInnerHTML={{ __html: subsection.content }} 
                          />
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>
    </div>
  )
} 