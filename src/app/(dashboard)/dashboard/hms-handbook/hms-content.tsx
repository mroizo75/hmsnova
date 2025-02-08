"use client"

import { Button } from "@/components/ui/button"
import { Editor } from "@/components/editor"
import { useState, useEffect } from "react"
import { Save } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { SectionChangesList } from "@/components/hms/section-changes-list"
import { SectionChanges } from "@/components/hms/section-changes"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils/date"
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { Toolbar } from '@/components/editor/toolbar'

interface Section {
  id: string
  title: string
  content: string | any
  order: number
  subsections: Section[]
  changes: Array<{
    id: string
    title: string
    description: string
    status: string
    implementedAt: Date | null
    createdAt: Date
    deviations: Array<{
      deviation: {
        id: string
        title: string
        description: string
      }
    }>
    riskAssessments: Array<{
      riskAssessment: {
        id: string
        title: string
        description: string
      }
    }>
    hazards: Array<{
      hazard: {
        id: string
        description: string
        riskLevel: number
      }
    }>
  }>
}

interface HMSContentProps {
  section?: Section
  isEditable?: boolean
  handbookId: string
}

export function HMSContent({ section, isEditable, handbookId }: HMSContentProps) {
  const router = useRouter()
  const [content, setContent] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: content,
    editable: isEditable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      console.log('Editor content updated:', html.substring(0, 100))
      setContent(html)
    },
  })

  useEffect(() => {
    if (section && editor) {
      console.log('Setting editor content:', section.content)
      
      const newContent = typeof section.content === 'string' 
        ? section.content
        : section.content?.html || JSON.stringify(section.content)
      
      editor.commands.setContent(newContent)
      setContent(newContent)
    }
  }, [section, editor])

  async function onSave() {
    try {
      setIsSaving(true)
      const response = await fetch(`/api/hms-handbook/sections/${section?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          isDraft: true
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message)
      }

      toast.success("Endringer lagret")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Kunne ikke lagre endringer")
    } finally {
      setIsSaving(false)
    }
  }

  // Legg til denne loggen rett før return
  console.log('Rendering HMSContent with:', {
    hasSection: !!section,
    isEditable,
    contentLength: content.length,
    contentPreview: content.substring(0, 100)
  })

  if (!section) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Velg en seksjon fra menyen til venstre
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{section.title}</h2>
        {isEditable && (
          <Button 
            onClick={onSave}
            disabled={isSaving}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Lagrer..." : "Lagre endringer"}
          </Button>
        )}
      </div>

      <div className="prose prose-green max-w-none border rounded-lg">
        {isEditable && <Toolbar editor={editor} />}
        <div className="p-4">
          <EditorContent editor={editor} />
        </div>
      </div>

      {section.subsections?.length > 0 && (
        <div className="mt-8 space-y-6">
          <h3 className="text-lg font-semibold">Underseksjoner</h3>
          {section.subsections.map(subsection => (
            <div key={subsection.id} className="border-l-2 pl-4">
              <h4 className="text-lg font-medium">{subsection.title}</h4>
              <div 
                className="prose prose-green max-w-none mt-2"
                dangerouslySetInnerHTML={{ 
                  __html: typeof subsection.content === 'object' 
                    ? subsection.content.html || JSON.stringify(subsection.content)
                    : subsection.content 
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Endringshistorikk */}
      {section.changes?.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-medium mb-4">Endringshistorikk</h2>
          <div className="space-y-4">
            {section.changes.map((change) => (
              <div key={change.id} className="border p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{change.title}</h3>
                  <Badge variant={change.status === 'OPEN' ? 'default' : 'secondary'}>
                    {change.status === 'OPEN' ? 'Tilknyttet' : change.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{change.description}</p>
                
                {/* Datoer og status */}
                <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium">Opprettet:</span> {formatDate(change.createdAt)}
                  </div>
                  {change.implementedAt && (
                    <div>
                      <span className="font-medium">Implementert:</span> {formatDate(change.implementedAt)}
                    </div>
                  )}
                </div>
                {/* Relaterte elementer */}
                <div className="mt-4 space-y-3">
                  {change.deviations.length > 0 && (
                    <div>
                      <p className="text-sm font-medium">Relaterte avvik:</p>
                      <ul className="list-disc list-inside text-sm">
                        {change.deviations.map(({ deviation }) => (
                          <li key={deviation.id} className="text-muted-foreground">
                            {deviation.title}
                            <p className="ml-6 mt-1">{deviation.description}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {change.riskAssessments.length > 0 && (
                    <div>
                      <p className="text-sm font-medium">Relaterte risikovurderinger:</p>
                      <ul className="list-disc list-inside text-sm">
                        {change.riskAssessments.map(({ riskAssessment }) => (
                          <li key={riskAssessment.id} className="text-muted-foreground">
                            {riskAssessment.title}
                            <p className="ml-6 mt-1">{riskAssessment.description}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 