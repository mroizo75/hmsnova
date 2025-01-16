"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus } from "lucide-react"
import { CreateTemplateDialog } from "./create-template-dialog"
import { TemplatesList } from "./templates-list"
import { useState } from "react"

interface Template {
  id: string
  name: string
  description: string | null
  industry: string | null
  isDefault: boolean
  sections: Array<{
    id: string
    title: string
    content: string
    order: number
    subsections: Array<{
      id: string
      title: string
      content: string
      order: number
    }>
  }>
}

interface Props {
  templates: Template[]
}

export function HMSTemplatesClient({ templates }: Props) {
  const [activeTab, setActiveTab] = useState("all")

  const standardTemplates = templates.filter(t => !t.industry)
  const industryTemplates = templates.filter(t => t.industry)

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">HMS-maler</h1>
        <CreateTemplateDialog />
      </div>

      <Tabs defaultValue="all" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            Alle maler ({templates.length})
          </TabsTrigger>
          <TabsTrigger value="standard">
            Standardmaler ({standardTemplates.length})
          </TabsTrigger>
          <TabsTrigger value="industry">
            Bransjespesifikke ({industryTemplates.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <TemplatesList templates={templates} />
        </TabsContent>

        <TabsContent value="standard">
          <TemplatesList templates={standardTemplates} />
        </TabsContent>

        <TabsContent value="industry">
          <TemplatesList templates={industryTemplates} />
        </TabsContent>
      </Tabs>
    </div>
  )
} 