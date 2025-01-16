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
  isEditing?: boolean
}

export function HMSContent({ section, isEditing = false }: HMSContentProps) {
  const router = useRouter()
  const [content, setContent] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // Oppdater content når seksjonen endres eller redigeringsmodus endres
  useEffect(() => {
    if (section) {
      // Håndter både string og JSON format
      if (typeof section.content === 'string') {
        try {
          // Prøv å parse JSON hvis det er lagret som string
          const parsed = JSON.parse(section.content)
          setContent(parsed)
        } catch {
          // Hvis det ikke er JSON, bruk det som det er
          setContent(section.content)
        }
      } else {
        // Hvis det allerede er et objekt
        setContent(section.content)
      }
    }
  }, [section, isEditing])

  if (!section) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Velg en seksjon fra menyen til venstre for å se innholdet
      </div>
    )
  }

  async function onSave() {
    try {
      setIsSaving(true)
      const response = await fetch(`/api/hms-handbook/sections/${section?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          isDraft: true // Indikerer at dette er en vanlig lagring, ikke en ny versjon
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{section.title}</h2>
        {isEditing && (
          <Button 
            onClick={onSave}
            disabled={isSaving}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Lagrer..." : "Lagre endringer"}
          </Button>
        )}
      </div>

      <div className="prose prose-green max-w-none">
        {isEditing ? (
          <Editor
            value={content}
            onChange={setContent}
            placeholder="Skriv innholdet her..."
          />
        ) : (
          <div dangerouslySetInnerHTML={{ __html: typeof content === 'string' ? content : ''}} />
        )}
      </div>

      {section.subsections.length > 0 && (
        <div className="mt-8 space-y-6">
          <h3 className="text-lg font-semibold">Underseksjoner</h3>
          {section.subsections.map(subsection => (
            <div key={subsection.id} className="border-l-2 pl-4">
              <h4 className="text-lg font-medium">{subsection.title}</h4>
              <div 
                className="prose prose-green max-w-none mt-2"
                dangerouslySetInnerHTML={{ __html: typeof subsection.content === 'string' ? subsection.content : '' }}
              />
            </div>
          ))}
        </div>
      )}

      {section && (
        <Card>
          <CardHeader>
            <CardTitle>Endringshistorikk</CardTitle>
            <CardDescription>
              Endringer fra avvik og risikovurderinger som påvirker denne seksjonen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SectionChanges 
              sectionId={section.id}
              isEditing={isEditing}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
} 