"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import * as diff from 'diff'

interface HMSReleaseVersion {
  id: string
  version: number
  content: string | any
  changes: string
  reason: string
  approvedBy: string
  createdAt: string
}

interface Props {
  versions: HMSReleaseVersion[]
}

export function CompareClient({ versions }: Props) {
  const [selectedVersions, setSelectedVersions] = useState<{v1?: string, v2?: string}>({})
  const [comparison, setComparison] = useState<{v1?: any, v2?: any}>({})

  async function handleCompare() {
    if (!selectedVersions.v1 || !selectedVersions.v2) return

    try {
      const [v1, v2] = await Promise.all([
        fetch(`/api/hms-handbook/release/${selectedVersions.v1}`).then(res => res.json()),
        fetch(`/api/hms-handbook/release/${selectedVersions.v2}`).then(res => res.json())
      ])

      // Normaliser innholdet til samme format
      const content1 = typeof v1.content === 'string' ? JSON.parse(v1.content) : v1.content
      const content2 = typeof v2.content === 'string' ? JSON.parse(v2.content) : v2.content

      // Sikre at vi har sections array for begge
      const sections1 = content1.sections || content1
      const sections2 = Array.isArray(content2) ? content2 : content2.sections || []

      setComparison({ 
        v1: { ...v1, content: { sections: sections1 } },
        v2: { ...v2, content: { sections: sections2 } }
      })
    } catch (error) {
      console.error('Error comparing versions:', error)
    }
  }

  function renderDiff(oldText: string, newText: string) {
    if (!oldText || !newText) return null
    
    // Fjern HTML-tags for bedre sammenligning
    const cleanOldText = oldText.replace(/<[^>]*>/g, '')
    const cleanNewText = newText.replace(/<[^>]*>/g, '')
    
    const differences = diff.diffWords(cleanOldText, cleanNewText)
    
    return differences.map((part, index) => {
      const color = part.added 
        ? 'bg-green-200 text-green-900 px-1 rounded mx-0.5' 
        : part.removed 
          ? 'bg-red-200 text-red-900 px-1 rounded mx-0.5' 
          : 'text-gray-800'
      
      return (
        <span key={index} className={color}>
          {part.value}
        </span>
      )
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Sammenlign versjoner</h1>
      </div>

      <Card className="p-6">
        <div className="flex gap-4 items-center mb-6">
          <Select onValueChange={(value) => setSelectedVersions(prev => ({ ...prev, v1: value }))}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Velg versjon" />
            </SelectTrigger>
            <SelectContent>
              {versions.map((version) => (
                <SelectItem 
                  key={version.id} 
                  value={version.id}
                  disabled={version.id === selectedVersions.v2}
                >
                  Versjon {version.version}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span>vs</span>

          <Select onValueChange={(value) => setSelectedVersions(prev => ({ ...prev, v2: value }))}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Velg versjon" />
            </SelectTrigger>
            <SelectContent>
              {versions.map((version) => (
                <SelectItem 
                  key={version.id} 
                  value={version.id}
                  disabled={version.id === selectedVersions.v1}
                >
                  Versjon {version.version}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            onClick={handleCompare}
            disabled={!selectedVersions.v1 || !selectedVersions.v2}
          >
            Sammenlign
          </Button>
        </div>

        {comparison.v1 && comparison.v2 && (
          <ScrollArea className="h-[600px] rounded-md border">
            <div className="p-4 space-y-6">
              {comparison.v1.content.sections?.map((section: any, index: number) => {
                const oldSection = comparison.v2.content.sections?.[index]
                if (!oldSection) return null

                return (
                  <div key={section.id || index} className="space-y-4">
                    <h3 className="font-semibold">
                      {renderDiff(oldSection.title || '', section.title || '')}
                    </h3>
                    <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                      {renderDiff(
                        oldSection.content || '',
                        section.content || ''
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        )}
      </Card>
    </div>
  )
} 