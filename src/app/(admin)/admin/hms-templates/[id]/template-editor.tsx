"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Editor } from "@/components/editor"
import { ChevronLeft, Save, Plus, Trash2, GripVertical, Edit2 } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { AddSectionDialog } from "../add-section-dialog"
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { EditTemplateDialog } from "./edit-template-dialog"
import { Input } from "@/components/ui/input"

interface Section {
  id: string
  title: string
  content: string
  order: number
  subsections: Section[]
}

interface Template {
  id: string
  name: string
  description: string | null
  industry: string | null
  isDefault: boolean
  sections: Section[]
}

// Sortable Section Component
function SortableSection({ 
  section, 
  isSelected, 
  onSelect,
  onTitleChange 
}: { 
  section: Section
  isSelected: boolean
  onSelect: () => void 
  onTitleChange: (id: string, newTitle: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: section.id
  })
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(section.title)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim()) {
      onTitleChange(section.id, title)
      setIsEditing(false)
    }
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="group">
      {isEditing ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-9"
            autoFocus
            onBlur={handleSubmit}
          />
        </form>
      ) : (
        <Button
          variant={isSelected ? "default" : "ghost"}
          className="w-full justify-between group"
          onClick={onSelect}
          onDoubleClick={() => setIsEditing(true)}
        >
          <span>{section.title}</span>
          <div className="flex items-center gap-2">
            <Edit2 
              className="h-4 w-4 opacity-0 group-hover:opacity-100 cursor-pointer" 
              onClick={(e) => {
                e.stopPropagation()
                setIsEditing(true)
              }}
            />
            <GripVertical 
              className="h-4 w-4 opacity-0 group-hover:opacity-100" 
              {...listeners}
            />
          </div>
        </Button>
      )}
    </div>
  )
}

export function TemplateEditor({ template }: { template: Template }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedSection, setSelectedSection] = useState<Section | null>(null)
  const [sections, setSections] = useState(template.sections)
  const [isSaving, setIsSaving] = useState(false)

  // Debug logging
  useEffect(() => {
    console.log('Initial sections:', sections.map(s => ({
      id: s.id,
      title: s.title,
      contentLength: s.content?.length
    })))
  }, [])

  const handleSectionSelect = (section: Section) => {
    console.log('Selecting section:', {
      id: section.id,
      title: section.title,
      content: section.content
    })
    setSelectedSection(section)
  }

  const handleNewSection = (newSection: Section) => {
    setSections(prev => [...prev, newSection])
    setSelectedSection(newSection)
  }

  const handleContentChange = (newContent: string) => {
    if (!selectedSection) return

    setSelectedSection(prev => prev ? { ...prev, content: newContent } : null)
    setSections(prev => prev.map(section => 
      section.id === selectedSection.id 
        ? { ...section, content: newContent }
        : section
    ))
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const response = await fetch(`/api/admin/hms-templates/${template.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Kunne ikke slette malen')

      toast.success('HMS-mal slettet')
      router.push('/admin/hms-templates')
      router.refresh()
    } catch (error) {
      toast.error('Kunne ikke slette HMS-malen')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSaveSection = async () => {
    if (!selectedSection) return

    try {
      setIsSaving(true)
      const response = await fetch(`/api/admin/hms-templates/${template.id}/sections/${selectedSection.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ content: selectedSection.content })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Kunne ikke lagre seksjonen')
      }

      const updatedSection = await response.json()
      
      // Oppdater seksjonen i den lokale state
      setSections(prev => prev.map(section => 
        section.id === selectedSection.id 
          ? { ...section, content: updatedSection.content }
          : section
      ))
      setSelectedSection(prev => prev ? { ...prev, content: updatedSection.content } : null)

      toast.success('Seksjon lagret')
    } catch (error) {
      console.error('Error saving section:', error)
      toast.error('Kunne ikke lagre seksjonen')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = sections.findIndex(s => s.id === active.id)
    const newIndex = sections.findIndex(s => s.id === over.id)

    const newSections = [...sections]
    const [movedSection] = newSections.splice(oldIndex, 1)
    newSections.splice(newIndex, 0, movedSection)

    setSections(newSections)

    // Oppdater rekkefølgen på server
    try {
      const response = await fetch(`/api/admin/hms-templates/${template.id}/sections/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sections: newSections.map((s, i) => ({
            id: s.id,
            order: i
          }))
        })
      })

      if (!response.ok) throw new Error('Kunne ikke oppdatere rekkefølgen')
      toast.success('Rekkefølge oppdatert')
    } catch (error) {
      toast.error('Kunne ikke oppdatere rekkefølgen')
      setSections(template.sections) // Reset til original rekkefølge
    }
  }

  const handleTitleChange = async (sectionId: string, newTitle: string) => {
    try {
      const response = await fetch(`/api/admin/hms-templates/${template.id}/sections/${sectionId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ title: newTitle })
      })

      if (!response.ok) {
        throw new Error('Kunne ikke oppdatere tittelen')
      }

      const updatedSection = await response.json()
      
      // Oppdater seksjonen i den lokale state
      setSections(prev => prev.map(section => 
        section.id === sectionId
          ? { ...section, title: updatedSection.title }
          : section
      ))

      // Oppdater også selectedSection hvis det er den som ble endret
      if (selectedSection?.id === sectionId) {
        setSelectedSection(prev => prev ? { ...prev, title: updatedSection.title } : null)
      }

      toast.success('Tittel oppdatert')
    } catch (error) {
      toast.error('Kunne ikke oppdatere tittelen')
    }
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/hms-templates">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Tilbake
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{template.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <EditTemplateDialog template={template} />
          <AddSectionDialog templateId={template.id} onSuccess={handleNewSection} />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Slett mal
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Er du sikker?</AlertDialogTitle>
                <AlertDialogDescription>
                  Dette vil permanent slette malen og alle dens seksjoner.
                  Denne handlingen kan ikke angres.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Avbryt</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Sletter..." : "Slett mal"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Seksjoner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={sections} strategy={verticalListSortingStrategy}>
                  {sections.map(section => (
                    <SortableSection
                      key={section.id}
                      section={section}
                      isSelected={selectedSection?.id === section.id}
                      onSelect={() => handleSectionSelect(section)}
                      onTitleChange={handleTitleChange}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-9">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {selectedSection ? selectedSection.title : "Velg en seksjon"}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {selectedSection ? (
                <>
                  <Editor
                    key={selectedSection.id}
                    value={selectedSection.content}
                    onChange={handleContentChange}
                  />
                  <div className="mt-4 flex justify-end">
                    <Button 
                      onClick={handleSaveSection}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>Lagrer...</>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Lagre
                        </>
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  Velg en seksjon fra menyen til venstre for å redigere innholdet
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 