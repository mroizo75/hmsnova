"use client"

import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronDown, Plus, Settings } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import React from "react"

interface Section {
  id: string
  title: string
  order: number
  subsections: Section[]
}

interface HMSNavigationProps {
  sections: Section[]
  handbookId: string
  selectedSection?: string
  onSelectSection?: (sectionId: string) => void
}

export function HMSNavigation({ 
  sections, 
  handbookId, 
  selectedSection,
  onSelectSection 
}: HMSNavigationProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([])

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
    const isSelected = selectedSection === section.id

    return (
      <div key={section.id}>
        <div 
          className={cn(
            "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer",
            isSelected ? "bg-accent" : "hover:bg-accent/50",
            level > 0 && "ml-4"
          )}
          onClick={() => {
            if (hasSubsections) {
              toggleSection(section.id)
            }
            onSelectSection?.(section.id)
          }}
        >
          <Button
            variant="ghost"
            size="sm"
            className="w-6 h-6 p-0"
          >
            {hasSubsections && (
              isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
            )}
          </Button>
          <span className="flex-1 text-sm">{section.title}</span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation()
                // Åpne redigeringsdialog
              }}
            >
              <Settings className="h-4 w-4" />
            </Button>
            {hasSubsections && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation()
                  // Åpne legg til underseksjon dialog
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {isExpanded && hasSubsections && (
          <div className="mt-1">
            {section.subsections.map(subsection => 
              renderSection(subsection, level + 1)
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {sections.map(section => renderSection(section))}
    </div>
  )
} 