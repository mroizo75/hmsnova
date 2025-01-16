"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronDown, ChevronRight, Plus, Settings } from "lucide-react"
import { useState } from "react"
import { AddSectionDialog } from "./add-section-dialog"
import { EditSectionDialog } from "./edit-section-dialog"
import React from "react"

interface Section {
  id: string
  title: string
  content: any
  order: number
  subsections: Section[]
}

interface HMSHandbook {
  id: string
  version: number
  sections: Section[]
}

interface HMSHandbookEditorProps {
  handbook: HMSHandbook
}

export function HMSHandbookEditor({ handbook }: HMSHandbookEditorProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([])
  const [editingSection, setEditingSection] = useState<Section | null>(null)

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const renderSection = (section: Section, level = 0) => {
    const isExpanded = expandedSections.includes(section.id)
    const hasSubsections = section.subsections.length > 0

    return (
      <div key={section.id} className="space-y-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-6 h-6 p-0"
            onClick={() => toggleSection(section.id)}
          >
            {hasSubsections && (
              isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
            )}
          </Button>
          
          <div 
            className="flex-1 flex items-center justify-between p-2 hover:bg-accent rounded-md cursor-pointer"
            onClick={() => toggleSection(section.id)}
          >
            <span className="font-medium">{section.title}</span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setEditingSection(section)
                }}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <AddSectionDialog 
                handbookId={handbook.id} 
                parentId={section.id}
                trigger={
                  <Button variant="ghost" size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                }
              />
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className={`pl-6 space-y-2 ${level > 0 ? 'border-l' : ''}`}>
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: section.content }} />
            </div>
            {section.subsections.map(subsection => 
              renderSection(subsection, level + 1)
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {handbook.sections.map(section => renderSection(section))}
      
      {editingSection && (
        <EditSectionDialog
          section={editingSection}
          open={true}
          onOpenChange={() => setEditingSection(null)}
        />
      )}
    </div>
  )
} 