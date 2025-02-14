"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Editor } from "@/components/editor"
import { PendingChangesDialog } from "@/app/(dashboard)/dashboard/hms-handbook/draft/[id]/pending-changes-dialog"
import { SectionChangesList } from "@/components/hms/section-changes-list"
import { Plus } from "lucide-react"

interface Props {
  sectionId: string
  title: string
  content: any
  onSave: (content: any) => Promise<void>
}

export function SectionEditor({ sectionId, title, content, onSave }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [isChangesDialogOpen, setIsChangesDialogOpen] = useState(false)
  const [editorContent, setEditorContent] = useState(content)
  const [shouldRefreshChanges, setShouldRefreshChanges] = useState(0)

  const handleSave = async () => {
    await onSave(editorContent)
    setIsEditing(false)
  }

  const handleChangesSelected = () => {
    // Trigger oppdatering av endringslisten
    setShouldRefreshChanges(prev => prev + 1)
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setIsChangesDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Legg til HMS-endringer
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Avbryt" : "Rediger"}
          </Button>
          {isEditing && (
            <Button onClick={handleSave}>
              Lagre
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <Editor
          value={editorContent}
          onChange={setEditorContent}
        />

        {/* Vis aktive HMS-endringer */}
        <SectionChangesList 
          sectionId={sectionId} 
          key={shouldRefreshChanges} // Tvinger ny rendering når endringer er lagt til
        />
      </div>

      <PendingChangesDialog
        open={isChangesDialogOpen}
        onOpenChange={setIsChangesDialogOpen}
        sectionId={sectionId}
        onChangesSelected={handleChangesSelected}
      />
    </Card>
  )
} 