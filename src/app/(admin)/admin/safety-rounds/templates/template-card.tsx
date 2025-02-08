"use client"

import { SafetyRoundTemplate } from "@/types/safety-rounds"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Building2, Copy } from "lucide-react"
import { formatDate } from "@/lib/utils/date"
import { useState } from "react"
import { AssignTemplateDialog } from "./assign-template-dialog"
import { EditTemplateDialog } from "./edit-template-dialog"
import { toast } from "react-hot-toast"
import { cn } from "@/lib/utils"
import { AssignedCompaniesDialog } from "./assigned-companies-dialog"

interface TemplateCardProps {
  template: SafetyRoundTemplate
  onUpdate: (template: SafetyRoundTemplate) => void
}

export function TemplateCard({ template, onUpdate }: TemplateCardProps) {
  const totalCheckpoints = template.sections.reduce(
    (acc, section) => acc + section.checkpoints.length,
    0
  )

  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [duplicating, setDuplicating] = useState(false)
  const [assignedCompaniesOpen, setAssignedCompaniesOpen] = useState(false)

  const handleDuplicate = async () => {
    try {
      setDuplicating(true)
      const response = await fetch(`/api/admin/safety-round-templates/${template.id}/duplicate`, {
        method: 'POST'
      })

      if (!response.ok) throw new Error('Kunne ikke duplisere mal')

      const duplicatedTemplate = await response.json()
      toast.success('Mal duplisert')
      
      onUpdate(duplicatedTemplate)
    } catch (error) {
      console.error('Error duplicating template:', error)
      toast.error('Kunne ikke duplisere mal')
    } finally {
      setDuplicating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{template.name}</CardTitle>
            <CardDescription>
              {template.description || "Ingen beskrivelse"}
            </CardDescription>
          </div>
          <Badge variant={template.isActive ? "default" : "secondary"}>
            {template.isActive ? "Aktiv" : "Inaktiv"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Bransje: </span>
              {template.industry || "Alle"}
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Seksjoner: </span>
              {template.sections.length}
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Sjekkpunkter: </span>
              {totalCheckpoints}
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Sist oppdatert: </span>
              {formatDate(template.updatedAt)}
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => setEditDialogOpen(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Rediger
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={handleDuplicate}
              disabled={duplicating}
            >
              <Copy className={cn("h-4 w-4 mr-2", {
                "animate-spin": duplicating
              })} />
              {duplicating ? "Dupliserer..." : "Dupliser"}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => setAssignDialogOpen(true)}
            >
              <Building2 className="h-4 w-4 mr-2" />
              Tildel
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAssignedCompaniesOpen(true)}
        >
          <Building2 className="h-4 w-4 mr-2" />
          Tilknyttede bedrifter
        </Button>
      </CardFooter>
      <AssignTemplateDialog
        templateId={template.id}
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        onSuccess={() => {
          onUpdate(template)
        }}
      />
      <EditTemplateDialog
        template={template}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={onUpdate}
      />
      <AssignedCompaniesDialog
        templateId={template.id}
        templateName={template.name}
        open={assignedCompaniesOpen}
        onOpenChange={setAssignedCompaniesOpen}
        onUnassign={() => {
          onUpdate(template)
        }}
      />
    </Card>
  )
} 