"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { SafetyRoundTemplate } from "@/types/safety-rounds"
import { TemplateCard } from "./template-card"
import { CreateTemplateDialog } from "./create-template-dialog"

interface TemplatesClientProps {
  templates: SafetyRoundTemplate[]
}

export function TemplatesClient({ templates: initialTemplates }: TemplatesClientProps) {
  const [templates, setTemplates] = useState(initialTemplates)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleTemplateCreated = (newTemplate: SafetyRoundTemplate) => {
    setTemplates(prev => [newTemplate, ...prev])
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vernerunde Maler</h1>
          <p className="text-muted-foreground">
            Administrer maler for vernerunder
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Ny mal
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map(template => (
          <TemplateCard 
            key={template.id} 
            template={template}
            onUpdate={(updatedTemplate) => {
              setTemplates(prev => 
                prev.map(t => 
                  t.id === updatedTemplate.id ? updatedTemplate : t
                )
              )
            }}
          />
        ))}
      </div>

      <CreateTemplateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleTemplateCreated}
      />
    </div>
  )
} 