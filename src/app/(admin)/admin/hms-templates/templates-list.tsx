"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit2, Copy, Star } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"

interface Template {
  id: string
  name: string
  description: string | null
  industry: string | null
  isDefault: boolean
  sections: Array<{
    id: string
    title: string
    subsections: any[]
  }>
}

export function TemplatesList({ templates }: { templates: Template[] }) {
  const router = useRouter()

  const handleDuplicate = async (templateId: string) => {
    try {
      const response = await fetch(`/api/admin/hms-templates/${templateId}/duplicate`, {
        method: 'POST'
      })

      if (!response.ok) throw new Error('Kunne ikke duplisere malen')

      toast.success('Mal duplisert')
      router.refresh()
    } catch (error) {
      toast.error('Kunne ikke duplisere malen')
    }
  }

  if (templates.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          Ingen maler funnet
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {templates.map(template => (
        <Card key={template.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {template.name}
                  {template.isDefault && (
                    <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />
                  )}
                </CardTitle>
                <CardDescription>
                  {template.description || "Ingen beskrivelse"}
                </CardDescription>
              </div>
              {template.industry && (
                <Badge variant="secondary">
                  {template.industry}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Seksjoner ({template.sections.length})</p>
                <ul className="mt-2 text-sm text-muted-foreground">
                  {template.sections.slice(0, 3).map(section => (
                    <li key={section.id}>• {section.title}</li>
                  ))}
                  {template.sections.length > 3 && (
                    <li>• ... og {template.sections.length - 3} til</li>
                  )}
                </ul>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  asChild
                >
                  <Link href={`/admin/hms-templates/${template.id}`}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Rediger
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDuplicate(template.id)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Dupliser
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 