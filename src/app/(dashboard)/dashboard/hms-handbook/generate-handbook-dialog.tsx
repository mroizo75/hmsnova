"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

interface GenerateHandbookDialogProps {
  templates: {
    id: string
    name: string
    description?: string | null
  }[]
}

export function GenerateHandbookDialog({ templates }: GenerateHandbookDialogProps) {
  const { data: session } = useSession()
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const generateHandbook = async () => {
    if (!session?.user?.companyId) {
      toast.error('Ingen bedrift funnet')
      return
    }

    try {
      setLoading(true)
      console.log("Generating handbook with template:", selectedTemplate)

      const response = await fetch('/api/hms-handbook/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId: session.user.companyId,  // Send med companyId
          templateId: selectedTemplate || templates[0]?.id
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Kunne ikke generere HMS-håndbok')
      }

      toast.success('HMS-håndbok er generert')
      window.location.reload()
    } catch (error) {
      console.error("Generate error:", error)
      toast.error(error instanceof Error ? error.message : 'Noe gikk galt')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Generer HMS-håndbok</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generer HMS-håndbok</DialogTitle>
          <DialogDescription>
            Velg en mal for HMS-håndboken
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Select
            value={selectedTemplate}
            onValueChange={setSelectedTemplate}
          >
            <SelectTrigger>
              <SelectValue placeholder="Velg mal" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={generateHandbook} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Genererer...' : 'Generer HMS-håndbok'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 